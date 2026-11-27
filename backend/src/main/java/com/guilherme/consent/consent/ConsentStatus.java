package com.guilherme.consent.consent;

import com.guilherme.consent.policy.PrivacyPolicy;

public record ConsentStatus(boolean shouldShowModal, PrivacyPolicy currentPolicy) {
}
