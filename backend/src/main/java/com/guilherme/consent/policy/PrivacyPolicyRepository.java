package com.guilherme.consent.policy;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface PrivacyPolicyRepository extends JpaRepository<PrivacyPolicy, Long> {

	@Query("select policy from PrivacyPolicy policy where policy.isCurrent = true")
	Optional<PrivacyPolicy> findCurrentPolicy();

}
