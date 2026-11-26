package com.guilherme.consent.settings;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "privacy_settings")
public class PrivacySettings {

	public static final int SINGLE_ROW_ID = 1;

	@Id
	private Integer id;

	@Column(name = "notification_enabled", nullable = false)
	private boolean notificationEnabled;

	@Column(name = "updated_at", nullable = false)
	private Instant updatedAt;

	protected PrivacySettings() {
	}

	public PrivacySettings(boolean notificationEnabled) {
		this.id = SINGLE_ROW_ID;
		this.notificationEnabled = notificationEnabled;
		this.updatedAt = Instant.now();
	}

	public void changeNotificationEnabled(boolean notificationEnabled) {
		this.notificationEnabled = notificationEnabled;
		this.updatedAt = Instant.now();
	}

	public Integer getId() {
		return id;
	}

	public boolean isNotificationEnabled() {
		return notificationEnabled;
	}

	public Instant getUpdatedAt() {
		return updatedAt;
	}

}
