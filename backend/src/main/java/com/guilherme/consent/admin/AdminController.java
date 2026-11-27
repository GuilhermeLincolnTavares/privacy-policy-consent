package com.guilherme.consent.admin;

import com.guilherme.consent.consent.ConsentService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

	private final ConsentService consentService;

	public AdminController(ConsentService consentService) {
		this.consentService = consentService;
	}

	@GetMapping("/users")
	public List<AdminUserResponse> listUsers() {
		return consentService.listUsersWithConsentStatus().stream()
				.map(AdminUserResponse::from)
				.toList();
	}

	@GetMapping("/settings")
	public NotificationSettingsResponse getSettings() {
		return new NotificationSettingsResponse(consentService.isNotificationEnabled());
	}

	@PutMapping("/settings")
	public NotificationSettingsResponse updateSettings(
			@Valid @RequestBody NotificationSettingsRequest request) {
		consentService.changeNotificationEnabled(request.notificationEnabled());
		return new NotificationSettingsResponse(consentService.isNotificationEnabled());
	}

}
