package com.guilherme.consent.policy;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "privacy_policies")
public class PrivacyPolicy {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, unique = true)
	private int version;

	@Column(nullable = false, length = 160)
	private String title;

	@Column(nullable = false)
	private String content;

	@Column(name = "is_current", nullable = false)
	private boolean isCurrent;

	@Column(name = "created_at", nullable = false)
	private Instant createdAt;

	protected PrivacyPolicy() {
	}

	public PrivacyPolicy(int version, String title, String content, boolean isCurrent) {
		this.version = version;
		this.title = title;
		this.content = content;
		this.isCurrent = isCurrent;
		this.createdAt = Instant.now();
	}

	public Long getId() {
		return id;
	}

	public int getVersion() {
		return version;
	}

	public String getTitle() {
		return title;
	}

	public String getContent() {
		return content;
	}

	public boolean isCurrent() {
		return isCurrent;
	}

	public Instant getCreatedAt() {
		return createdAt;
	}

}
