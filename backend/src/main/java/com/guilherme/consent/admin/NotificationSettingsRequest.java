package com.guilherme.consent.admin;

import jakarta.validation.constraints.NotNull;

public record NotificationSettingsRequest(@NotNull Boolean notificationEnabled) {
}
