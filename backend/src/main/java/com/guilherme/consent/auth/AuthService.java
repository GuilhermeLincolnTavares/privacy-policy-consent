package com.guilherme.consent.auth;

import com.guilherme.consent.user.User;
import com.guilherme.consent.user.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final TokenService tokenService;

	public AuthService(
			UserRepository userRepository,
			PasswordEncoder passwordEncoder,
			TokenService tokenService) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
		this.tokenService = tokenService;
	}

	public LoginResponse login(LoginRequest request) {
		User user = userRepository.findByEmail(request.email())
				.filter(candidate -> passwordMatches(request.password(), candidate))
				.orElseThrow(InvalidCredentialsException::new);
		return new LoginResponse(tokenService.issueTokenFor(user), user.getName(), user.getRole());
	}

	private boolean passwordMatches(String rawPassword, User user) {
		return passwordEncoder.matches(rawPassword, user.getPasswordHash());
	}

}
