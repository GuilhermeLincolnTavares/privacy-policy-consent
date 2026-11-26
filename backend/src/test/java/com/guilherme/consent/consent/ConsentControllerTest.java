package com.guilherme.consent.consent;

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
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ConsentControllerTest {

	private static final String STATUS_URL = "/api/consent/status";
	private static final String ACCEPT_URL = "/api/consent/accept";

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private PasswordEncoder passwordEncoder;

	@Autowired
	private ConsentService consentService;

	private User user;
	private String userAuthorization;

	@BeforeEach
	void createUserAndEnableNotification() throws Exception {
		consentService.changeNotificationEnabled(true);
		ApiTestSupport support = new ApiTestSupport(mockMvc, userRepository, passwordEncoder);
		user = support.createRegularUser();
		userAuthorization = support.loginAndGetAuthorizationHeader(
				user.getEmail(), ApiTestSupport.TEST_PASSWORD);
	}

	@AfterEach
	void deleteUserAndEnableNotification() {
		userRepository.deleteById(user.getId());
		consentService.changeNotificationEnabled(true);
	}

	@Test
	void statusIsRejectedWithoutToken() throws Exception {
		mockMvc.perform(get(STATUS_URL))
				.andExpect(status().isUnauthorized());
	}

	@Test
	void acceptIsRejectedWithoutToken() throws Exception {
		mockMvc.perform(post(ACCEPT_URL))
				.andExpect(status().isUnauthorized());
	}

	@Test
	void newUserShouldSeeTheModalWithTheCurrentPolicy() throws Exception {
		mockMvc.perform(get(STATUS_URL).header(HttpHeaders.AUTHORIZATION, userAuthorization))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.shouldShowModal").value(true))
				.andExpect(jsonPath("$.policy.version").isNumber())
				.andExpect(jsonPath("$.policy.title").isNotEmpty())
				.andExpect(jsonPath("$.policy.content").isNotEmpty());
	}

	@Test
	void acceptingStopsTheModalFromBeingShown() throws Exception {
		mockMvc.perform(post(ACCEPT_URL).header(HttpHeaders.AUTHORIZATION, userAuthorization))
				.andExpect(status().isNoContent());

		mockMvc.perform(get(STATUS_URL).header(HttpHeaders.AUTHORIZATION, userAuthorization))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.shouldShowModal").value(false));
	}

	@Test
	void acceptingTwiceIsAllowed() throws Exception {
		mockMvc.perform(post(ACCEPT_URL).header(HttpHeaders.AUTHORIZATION, userAuthorization))
				.andExpect(status().isNoContent());

		mockMvc.perform(post(ACCEPT_URL).header(HttpHeaders.AUTHORIZATION, userAuthorization))
				.andExpect(status().isNoContent());
	}

	@Test
	void modalIsHiddenWhenNotificationIsDisabled() throws Exception {
		consentService.changeNotificationEnabled(false);

		mockMvc.perform(get(STATUS_URL).header(HttpHeaders.AUTHORIZATION, userAuthorization))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.shouldShowModal").value(false));
	}

}
