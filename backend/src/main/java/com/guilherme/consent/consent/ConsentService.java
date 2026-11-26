package com.guilherme.consent.consent;

import com.guilherme.consent.policy.PrivacyPolicy;
import com.guilherme.consent.policy.PrivacyPolicyRepository;
import com.guilherme.consent.settings.PrivacySettings;
import com.guilherme.consent.settings.PrivacySettingsRepository;
import com.guilherme.consent.user.User;
import com.guilherme.consent.user.UserNotFoundException;
import com.guilherme.consent.user.UserRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ConsentService {

	private static final String MISSING_SETTINGS_MESSAGE = "Privacy settings row is missing";

	private final PrivacyPolicyRepository policyRepository;
	private final PrivacyConsentRepository consentRepository;
	private final PrivacySettingsRepository settingsRepository;
	private final UserRepository userRepository;

	public ConsentService(
			PrivacyPolicyRepository policyRepository,
			PrivacyConsentRepository consentRepository,
			PrivacySettingsRepository settingsRepository,
			UserRepository userRepository) {
		this.policyRepository = policyRepository;
		this.consentRepository = consentRepository;
		this.settingsRepository = settingsRepository;
		this.userRepository = userRepository;
	}

	@Transactional(readOnly = true)
	public ConsentStatus getStatusFor(Long userId) {
		PrivacyPolicy currentPolicy = findCurrentPolicy();
		boolean shouldShowModal = isNotificationEnabled() && !hasAccepted(userId, currentPolicy);
		return new ConsentStatus(shouldShowModal, currentPolicy);
	}

	// Not @Transactional on purpose: a failed insert would mark the transaction
	// rollback-only, so a concurrent duplicate accept could not be absorbed.
	public void acceptCurrentPolicy(Long userId) {
		PrivacyPolicy currentPolicy = findCurrentPolicy();
		if (hasAccepted(userId, currentPolicy)) {
			return;
		}
		User user = userRepository.findById(userId)
				.orElseThrow(() -> new UserNotFoundException(userId));
		saveConsent(user, currentPolicy);
	}

	@Transactional
	public void changeNotificationEnabled(boolean notificationEnabled) {
		findSettings().changeNotificationEnabled(notificationEnabled);
	}

	private void saveConsent(User user, PrivacyPolicy policy) {
		try {
			consentRepository.save(new PrivacyConsent(user, policy));
		} catch (DataIntegrityViolationException exception) {
			if (!hasAccepted(user.getId(), policy)) {
				throw exception;
			}
		}
	}

	private boolean hasAccepted(Long userId, PrivacyPolicy policy) {
		return consentRepository.existsByUserIdAndPolicyId(userId, policy.getId());
	}

	private boolean isNotificationEnabled() {
		return findSettings().isNotificationEnabled();
	}

	private PrivacyPolicy findCurrentPolicy() {
		return policyRepository.findCurrentPolicy().orElseThrow(NoCurrentPolicyException::new);
	}

	private PrivacySettings findSettings() {
		return settingsRepository.findById(PrivacySettings.SINGLE_ROW_ID)
				.orElseThrow(() -> new IllegalStateException(MISSING_SETTINGS_MESSAGE));
	}

}
