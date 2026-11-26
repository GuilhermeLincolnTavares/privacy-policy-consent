package com.guilherme.consent.support;

import com.guilherme.consent.user.User;
import com.guilherme.consent.user.UserRepository;
import com.guilherme.consent.user.UserRole;
import com.jayway.jsonpath.JsonPath;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public class ApiTestSupport {

	public static final String TEST_PASSWORD = "test-password";
	public static final String ADMIN_EMAIL = "admin@email.com";
	public static final String ADMIN_PASSWORD = "admin123";

	private static final String LOGIN_URL = "/api/auth/login";
	private static final String BEARER_PREFIX = "Bearer ";

	private final MockMvc mockMvc;
	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;

	public ApiTestSupport(MockMvc mockMvc, UserRepository userRepository, PasswordEncoder passwordEncoder) {
		this.mockMvc = mockMvc;
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
	}

	public User createRegularUser() {
		String uniqueEmail = UUID.randomUUID() + "@test.local";
		String passwordHash = passwordEncoder.encode(TEST_PASSWORD);
		return userRepository.save(new User("API Test User", uniqueEmail, passwordHash, UserRole.USER));
	}

	public String loginAndGetAuthorizationHeader(String email, String password) throws Exception {
		String responseBody = mockMvc.perform(post(LOGIN_URL)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"email": "%s", "password": "%s"}
								""".formatted(email, password)))
				.andExpect(status().isOk())
				.andReturn()
				.getResponse()
				.getContentAsString();
		return BEARER_PREFIX + JsonPath.<String>read(responseBody, "$.token");
	}

}
