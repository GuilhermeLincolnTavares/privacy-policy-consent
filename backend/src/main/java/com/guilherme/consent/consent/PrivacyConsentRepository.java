package com.guilherme.consent.consent;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PrivacyConsentRepository extends JpaRepository<PrivacyConsent, Long> {

	boolean existsByUserIdAndPolicyId(Long userId, Long policyId);

}
