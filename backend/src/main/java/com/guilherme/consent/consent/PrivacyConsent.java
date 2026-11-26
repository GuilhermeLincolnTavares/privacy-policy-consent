package com.guilherme.consent.consent;

import com.guilherme.consent.policy.PrivacyPolicy;
import com.guilherme.consent.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "privacy_consents")
public class PrivacyConsent {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "user_id", nullable = false)
	private User user;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "policy_id", nullable = false)
	private PrivacyPolicy policy;

	@Column(name = "accepted_at", nullable = false)
	private Instant acceptedAt;

	protected PrivacyConsent() {
	}

	public PrivacyConsent(User user, PrivacyPolicy policy) {
		this.user = user;
		this.policy = policy;
		this.acceptedAt = Instant.now();
	}

	public Long getId() {
		return id;
	}

	public User getUser() {
		return user;
	}

	public PrivacyPolicy getPolicy() {
		return policy;
	}

	public Instant getAcceptedAt() {
		return acceptedAt;
	}

}
