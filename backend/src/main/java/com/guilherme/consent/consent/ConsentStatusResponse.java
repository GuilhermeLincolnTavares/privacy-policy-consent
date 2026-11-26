package com.guilherme.consent.consent;

import com.guilherme.consent.policy.PolicyResponse;

public record ConsentStatusResponse(boolean shouldShowModal, PolicyResponse policy) {

	public static ConsentStatusResponse from(ConsentStatus status) {
		return new ConsentStatusResponse(
				status.shouldShowModal(),
				PolicyResponse.from(status.currentPolicy()));
	}

}
