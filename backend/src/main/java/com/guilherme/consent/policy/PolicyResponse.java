package com.guilherme.consent.policy;

public record PolicyResponse(int version, String title, String content) {

	public static PolicyResponse from(PrivacyPolicy policy) {
		return new PolicyResponse(policy.getVersion(), policy.getTitle(), policy.getContent());
	}

}
