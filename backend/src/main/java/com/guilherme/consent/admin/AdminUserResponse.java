package com.guilherme.consent.admin;

import com.guilherme.consent.consent.UserConsentSummary;
import com.guilherme.consent.user.UserRole;

import java.time.Instant;

public record AdminUserResponse(
		Long id,
		String name,
		String email,
		UserRole role,
		boolean acceptedCurrentPolicy,
		Instant acceptedAt) {

	public static AdminUserResponse from(UserConsentSummary summary) {
		return new AdminUserResponse(
				summary.userId(),
				summary.name(),
				summary.email(),
				summary.role(),
				summary.acceptedAt() != null,
				summary.acceptedAt());
	}

}
