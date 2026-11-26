package com.guilherme.consent.auth;

import com.guilherme.consent.config.JwtConfig;
import com.guilherme.consent.config.JwtProperties;
import com.guilherme.consent.user.User;
import com.guilherme.consent.user.UserRole;
import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class TokenServiceTest {

	private static final String SECRET = "unit-test-secret-key-with-at-least-32-characters";
	private static final String OTHER_SECRET = "another-secret-key-with-at-least-32-characters!";
	private static final Duration EXPIRATION = Duration.ofHours(8);
	private static final Long USER_ID = 7L;

	private final JwtConfig jwtConfig = new JwtConfig();
	private final JwtProperties jwtProperties = new JwtProperties(SECRET, EXPIRATION);
	private final TokenService tokenService =
			new TokenService(jwtConfig.jwtEncoder(jwtProperties), jwtProperties);
	private final JwtDecoder jwtDecoder = jwtConfig.jwtDecoder(jwtProperties);

	@Test
	void issuedTokenCarriesUserIdAsSubjectAndRoleAsClaim() {
		Jwt token = jwtDecoder.decode(tokenService.issueTokenFor(userWithRole(UserRole.ADMIN)));

		assertEquals(USER_ID.toString(), token.getSubject());
		assertEquals(UserRole.ADMIN.name(), token.getClaimAsString(TokenService.ROLE_CLAIM));
	}

	@Test
	void issuedTokenExpiresAfterTheConfiguredDuration() {
		Jwt token = jwtDecoder.decode(tokenService.issueTokenFor(userWithRole(UserRole.USER)));

		assertEquals(EXPIRATION, Duration.between(token.getIssuedAt(), token.getExpiresAt()));
	}

	@Test
	void decoderRejectsTokenSignedWithAnotherSecret() {
		JwtProperties otherProperties = new JwtProperties(OTHER_SECRET, EXPIRATION);
		TokenService otherTokenService =
				new TokenService(jwtConfig.jwtEncoder(otherProperties), otherProperties);
		String foreignToken = otherTokenService.issueTokenFor(userWithRole(UserRole.ADMIN));

		assertThrows(JwtException.class, () -> jwtDecoder.decode(foreignToken));
	}

	private User userWithRole(UserRole role) {
		User user = new User("Test", "test@email.com", "hash", role);
		ReflectionTestUtils.setField(user, "id", USER_ID);
		return user;
	}

}
