package com.guilherme.consent.auth;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerTest {

	private static final String LOGIN_URL = "/api/auth/login";
	private static final String PROTECTED_URL = "/api/consent/status";

	@Autowired
	private MockMvc mockMvc;

	@Test
	void loginReturnsTokenNameAndRoleForValidCredentials() throws Exception {
		mockMvc.perform(post(LOGIN_URL)
						.contentType(MediaType.APPLICATION_JSON)
						.content(loginJson("maria@email.com", "maria123")))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.token").isNotEmpty())
				.andExpect(jsonPath("$.name").value("Maria"))
				.andExpect(jsonPath("$.role").value("USER"));
	}

	@Test
	void loginReturnsAdminRoleForAdminUser() throws Exception {
		mockMvc.perform(post(LOGIN_URL)
						.contentType(MediaType.APPLICATION_JSON)
						.content(loginJson("admin@email.com", "admin123")))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.role").value("ADMIN"));
	}

	@Test
	void loginIsRejectedWhenPasswordIsWrong() throws Exception {
		mockMvc.perform(post(LOGIN_URL)
						.contentType(MediaType.APPLICATION_JSON)
						.content(loginJson("maria@email.com", "wrong-password")))
				.andExpect(status().isUnauthorized());
	}

	@Test
	void loginIsRejectedWhenEmailDoesNotExist() throws Exception {
		mockMvc.perform(post(LOGIN_URL)
						.contentType(MediaType.APPLICATION_JSON)
						.content(loginJson("nobody@email.com", "maria123")))
				.andExpect(status().isUnauthorized());
	}

	@Test
	void loginIsRejectedWhenFieldsAreBlank() throws Exception {
		mockMvc.perform(post(LOGIN_URL)
						.contentType(MediaType.APPLICATION_JSON)
						.content(loginJson("", "")))
				.andExpect(status().isBadRequest());
	}

	@Test
	void protectedRouteIsRejectedWithoutToken() throws Exception {
		mockMvc.perform(get(PROTECTED_URL))
				.andExpect(status().isUnauthorized());
	}

	@Test
	void protectedRouteIsRejectedWithInvalidToken() throws Exception {
		mockMvc.perform(get(PROTECTED_URL)
						.header(HttpHeaders.AUTHORIZATION, "Bearer not-a-valid-token"))
				.andExpect(status().isUnauthorized());
	}

	private String loginJson(String email, String password) {
		return """
				{"email": "%s", "password": "%s"}
				""".formatted(email, password);
	}

}
