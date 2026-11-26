package com.guilherme.consent.consent;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/consent")
public class ConsentController {

	private final ConsentService consentService;

	public ConsentController(ConsentService consentService) {
		this.consentService = consentService;
	}

	@GetMapping("/status")
	public ConsentStatusResponse getStatus(@AuthenticationPrincipal Jwt token) {
		return ConsentStatusResponse.from(consentService.getStatusFor(userIdFrom(token)));
	}

	@PostMapping("/accept")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void accept(@AuthenticationPrincipal Jwt token) {
		consentService.acceptCurrentPolicy(userIdFrom(token));
	}

	private Long userIdFrom(Jwt token) {
		return Long.valueOf(token.getSubject());
	}

}
