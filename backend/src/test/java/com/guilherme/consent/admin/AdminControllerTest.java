package com.guilherme.consent.admin;

import com.guilherme.consent.consent.ConsentService;
import com.guilherme.consent.support.ApiTestSupport;
import com.guilherme.consent.user.User;
import com.guilherme.consent.user.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AdminControllerTest {

	private static final String USERS_URL = "/api/admin/users";
	private static final String SETTINGS_URL = "/api/admin/settings";
	private static final String CONSENT_STATUS_URL = "/api/consent/status";

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private PasswordEncoder passwordEncoder;

	@Autowired
	private ConsentService consentService;

	private User regularUser;
	private String regularUserAuthorization;
	private String adminAuthorization;

	@BeforeEach
	void createUserAndLogin() throws Exception {
		consentService.changeNotificationEnabled(true);
		ApiTestSupport support = new ApiTestSupport(mockMvc, userRepository, passwordEncoder);
		regularUser = support.createRegularUser();
		regularUserAuthorization = support.loginAndGetAuthorizationHeader(
				regularUser.getEmail(), ApiTestSupport.TEST_PASSWORD);
		adminAuthorization = support.loginAndGetAuthorizationHeader(
				ApiTestSupport.ADMIN_EMAIL, ApiTestSupport.ADMIN_PASSWORD);
	}

	@AfterEach
	void deleteUserAndEnableNotification() {
		userRepository.deleteById(regularUser.getId());
		consentService.changeNotificationEnabled(true);
	}

	@Test
	void adminRoutesAreRejectedWithoutToken() throws Exception {
		mockMvc.perform(get(USERS_URL))
				.andExpect(status().isUnauthorized());
		mockMvc.perform(get(SETTINGS_URL))
				.andExpect(status().isUnauthorized());
	}

	@Test
	void adminRoutesAreForbiddenForRegularUsers() throws Exception {
		mockMvc.perform(get(USERS_URL).header(HttpHeaders.AUTHORIZATION, regularUserAuthorization))
				.andExpect(status().isForbidden());
		mockMvc.perform(get(SETTINGS_URL).header(HttpHeaders.AUTHORIZATION, regularUserAuthorization))
				.andExpect(status().isForbidden());
		mockMvc.perform(put(SETTINGS_URL)
						.header(HttpHeaders.AUTHORIZATION, regularUserAuthorization)
						.contentType(MediaType.APPLICATION_JSON)
						.content(notificationSettingsJson(false)))
				.andExpect(status().isForbidden());
	}

	@Test
	void gridShowsPendingUserBeforeAcceptingAndAcceptedUserAfterwards() throws Exception {
		String emailFilter = "$[?(@.email=='" + regularUser.getEmail() + "')]";

		mockMvc.perform(get(USERS_URL).header(HttpHeaders.AUTHORIZATION, adminAuthorization))
				.andExpect(status().isOk())
				.andExpect(jsonPath(emailFilter + ".acceptedCurrentPolicy").value(false))
				.andExpect(jsonPath(emailFilter + ".acceptedAt").value((Object) null));

		consentService.acceptCurrentPolicy(regularUser.getId());

		mockMvc.perform(get(USERS_URL).header(HttpHeaders.AUTHORIZATION, adminAuthorization))
				.andExpect(status().isOk())
				.andExpect(jsonPath(emailFilter + ".acceptedCurrentPolicy").value(true))
				.andExpect(jsonPath(emailFilter + ".acceptedAt").isNotEmpty());
	}

	@Test
	void adminReadsTheNotificationSettings() throws Exception {
		mockMvc.perform(get(SETTINGS_URL).header(HttpHeaders.AUTHORIZATION, adminAuthorization))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.notificationEnabled").value(true));
	}

	@Test
	void adminDisablingTheNotificationHidesTheModalFromUsers() throws Exception {
		mockMvc.perform(put(SETTINGS_URL)
						.header(HttpHeaders.AUTHORIZATION, adminAuthorization)
						.contentType(MediaType.APPLICATION_JSON)
						.content(notificationSettingsJson(false)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.notificationEnabled").value(false));

		mockMvc.perform(get(CONSENT_STATUS_URL).header(HttpHeaders.AUTHORIZATION, regularUserAuthorization))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.shouldShowModal").value(false));
	}

	@Test
	void adminEnablingTheNotificationShowsTheModalToPendingUsersAgain() throws Exception {
		consentService.changeNotificationEnabled(false);

		mockMvc.perform(put(SETTINGS_URL)
						.header(HttpHeaders.AUTHORIZATION, adminAuthorization)
						.contentType(MediaType.APPLICATION_JSON)
						.content(notificationSettingsJson(true)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.notificationEnabled").value(true));

		mockMvc.perform(get(CONSENT_STATUS_URL).header(HttpHeaders.AUTHORIZATION, regularUserAuthorization))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.shouldShowModal").value(true));
	}

	@Test
	void updatingTheSettingsWithoutTheFlagIsRejected() throws Exception {
		mockMvc.perform(put(SETTINGS_URL)
						.header(HttpHeaders.AUTHORIZATION, adminAuthorization)
						.contentType(MediaType.APPLICATION_JSON)
						.content("{}"))
				.andExpect(status().isBadRequest());
	}

	private String notificationSettingsJson(boolean notificationEnabled) {
		return """
				{"notificationEnabled": %s}
				""".formatted(notificationEnabled);
	}

}
