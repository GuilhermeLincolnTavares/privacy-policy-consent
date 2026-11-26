package com.guilherme.consent.consent;

import com.guilherme.consent.policy.PrivacyPolicy;
import com.guilherme.consent.policy.PrivacyPolicyRepository;
import com.guilherme.consent.settings.PrivacySettings;
import com.guilherme.consent.settings.PrivacySettingsRepository;
import com.guilherme.consent.user.User;
import com.guilherme.consent.user.UserNotFoundException;
import com.guilherme.consent.user.UserRepository;
import com.guilherme.consent.user.UserRole;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ConsentServiceTest {

	private static final Long USER_ID = 1L;
	private static final Long CURRENT_POLICY_ID = 2L;

	@Mock
	private PrivacyPolicyRepository policyRepository;

	@Mock
	private PrivacyConsentRepository consentRepository;

	@Mock
	private PrivacySettingsRepository settingsRepository;

	@Mock
	private UserRepository userRepository;

	private ConsentService consentService;

	@BeforeEach
	void createService() {
		consentService = new ConsentService(
				policyRepository, consentRepository, settingsRepository, userRepository);
	}

	@Test
	void showsModalWhenNotificationIsEnabledAndUserHasNotAcceptedCurrentPolicy() {
		PrivacyPolicy currentPolicy = currentPolicy();
		givenCurrentPolicy(currentPolicy);
		givenNotificationEnabled(true);
		givenUserHasAcceptedCurrentPolicy(false);

		ConsentStatus status = consentService.getStatusFor(USER_ID);

		assertTrue(status.shouldShowModal());
		assertSame(currentPolicy, status.currentPolicy());
	}

	@Test
	void doesNotShowModalWhenUserAlreadyAcceptedCurrentPolicy() {
		givenCurrentPolicy(currentPolicy());
		givenNotificationEnabled(true);
		givenUserHasAcceptedCurrentPolicy(true);

		ConsentStatus status = consentService.getStatusFor(USER_ID);

		assertFalse(status.shouldShowModal());
	}

	@Test
	void showsModalAgainWhenNewPolicyVersionIsPublishedAndUserOnlyAcceptedAnOlderOne() {
		givenCurrentPolicy(currentPolicy());
		givenNotificationEnabled(true);
		givenUserHasAcceptedCurrentPolicy(false);

		ConsentStatus status = consentService.getStatusFor(USER_ID);

		assertTrue(status.shouldShowModal());
	}

	@Test
	void doesNotShowModalWhenNotificationIsDisabledEvenIfUserHasNotAccepted() {
		givenCurrentPolicy(currentPolicy());
		givenNotificationEnabled(false);

		ConsentStatus status = consentService.getStatusFor(USER_ID);

		assertFalse(status.shouldShowModal());
		verify(consentRepository, never()).existsByUserIdAndPolicyId(any(), any());
	}

	@Test
	void statusFailsWhenThereIsNoCurrentPolicy() {
		when(policyRepository.findCurrentPolicy()).thenReturn(Optional.empty());

		assertThrows(NoCurrentPolicyException.class, () -> consentService.getStatusFor(USER_ID));
	}

	@Test
	void acceptSavesConsentForCurrentPolicyWhenUserHasNotAcceptedYet() {
		PrivacyPolicy currentPolicy = currentPolicy();
		User user = user();
		givenCurrentPolicy(currentPolicy);
		givenUserHasAcceptedCurrentPolicy(false);
		when(userRepository.findById(USER_ID)).thenReturn(Optional.of(user));

		consentService.acceptCurrentPolicy(USER_ID);

		ArgumentCaptor<PrivacyConsent> savedConsent = ArgumentCaptor.forClass(PrivacyConsent.class);
		verify(consentRepository).save(savedConsent.capture());
		assertSame(user, savedConsent.getValue().getUser());
		assertSame(currentPolicy, savedConsent.getValue().getPolicy());
	}

	@Test
	void acceptDoesNothingWhenUserAlreadyAcceptedCurrentPolicy() {
		givenCurrentPolicy(currentPolicy());
		givenUserHasAcceptedCurrentPolicy(true);

		consentService.acceptCurrentPolicy(USER_ID);

		verify(consentRepository, never()).save(any());
	}

	@Test
	void acceptAbsorbsDuplicateInsertCausedByConcurrentRequest() {
		givenCurrentPolicy(currentPolicy());
		when(consentRepository.existsByUserIdAndPolicyId(USER_ID, CURRENT_POLICY_ID))
				.thenReturn(false, true);
		when(userRepository.findById(USER_ID)).thenReturn(Optional.of(user()));
		when(consentRepository.save(any())).thenThrow(new DataIntegrityViolationException("duplicate"));

		assertDoesNotThrow(() -> consentService.acceptCurrentPolicy(USER_ID));
	}

	@Test
	void acceptRethrowsIntegrityErrorWhenConsentWasNotStored() {
		givenCurrentPolicy(currentPolicy());
		givenUserHasAcceptedCurrentPolicy(false);
		when(userRepository.findById(USER_ID)).thenReturn(Optional.of(user()));
		when(consentRepository.save(any())).thenThrow(new DataIntegrityViolationException("other"));

		assertThrows(DataIntegrityViolationException.class,
				() -> consentService.acceptCurrentPolicy(USER_ID));
	}

	@Test
	void acceptFailsWhenThereIsNoCurrentPolicy() {
		when(policyRepository.findCurrentPolicy()).thenReturn(Optional.empty());

		assertThrows(NoCurrentPolicyException.class,
				() -> consentService.acceptCurrentPolicy(USER_ID));
	}

	@Test
	void acceptFailsWhenUserDoesNotExist() {
		givenCurrentPolicy(currentPolicy());
		givenUserHasAcceptedCurrentPolicy(false);
		when(userRepository.findById(USER_ID)).thenReturn(Optional.empty());

		assertThrows(UserNotFoundException.class,
				() -> consentService.acceptCurrentPolicy(USER_ID));
		verify(consentRepository, never()).save(any());
	}

	@Test
	void changesNotificationSwitch() {
		PrivacySettings settings = new PrivacySettings(true);
		when(settingsRepository.findById(PrivacySettings.SINGLE_ROW_ID))
				.thenReturn(Optional.of(settings));

		consentService.changeNotificationEnabled(false);

		assertFalse(settings.isNotificationEnabled());
	}

	private PrivacyPolicy currentPolicy() {
		PrivacyPolicy policy = new PrivacyPolicy(2, "Privacy Policy", "Policy text", true);
		ReflectionTestUtils.setField(policy, "id", CURRENT_POLICY_ID);
		return policy;
	}

	private User user() {
		User user = new User("Maria", "maria@email.com", "hash", UserRole.USER);
		ReflectionTestUtils.setField(user, "id", USER_ID);
		return user;
	}

	private void givenCurrentPolicy(PrivacyPolicy policy) {
		when(policyRepository.findCurrentPolicy()).thenReturn(Optional.of(policy));
	}

	private void givenNotificationEnabled(boolean enabled) {
		when(settingsRepository.findById(PrivacySettings.SINGLE_ROW_ID))
				.thenReturn(Optional.of(new PrivacySettings(enabled)));
	}

	private void givenUserHasAcceptedCurrentPolicy(boolean accepted) {
		when(consentRepository.existsByUserIdAndPolicyId(USER_ID, CURRENT_POLICY_ID))
				.thenReturn(accepted);
	}

}
