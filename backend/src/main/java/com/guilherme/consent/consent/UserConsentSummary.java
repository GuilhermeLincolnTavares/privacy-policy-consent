package com.guilherme.consent.consent;

import com.guilherme.consent.user.UserRole;

import java.time.Instant;

public record UserConsentSummary(
		Long userId,
		String name,
		String email,
		UserRole role,
		Instant acceptedAt) {
}
