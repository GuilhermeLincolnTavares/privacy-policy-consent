package com.guilherme.consent.consent;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface PrivacyConsentRepository extends JpaRepository<PrivacyConsent, Long> {

	boolean existsByUserIdAndPolicyId(Long userId, Long policyId);

	@Query("""
			select new com.guilherme.consent.consent.UserConsentSummary(
				registeredUser.id, registeredUser.name, registeredUser.email,
				registeredUser.role, consent.acceptedAt)
			from User registeredUser
			left join PrivacyConsent consent
				on consent.user = registeredUser and consent.policy.id = :policyId
			order by registeredUser.name
			""")
	List<UserConsentSummary> findAllUsersWithConsentFor(Long policyId);

}
