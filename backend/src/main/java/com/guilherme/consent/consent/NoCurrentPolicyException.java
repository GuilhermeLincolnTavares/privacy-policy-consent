package com.guilherme.consent.consent;

public class NoCurrentPolicyException extends RuntimeException {

	public NoCurrentPolicyException() {
		super("There is no current privacy policy");
	}

}
