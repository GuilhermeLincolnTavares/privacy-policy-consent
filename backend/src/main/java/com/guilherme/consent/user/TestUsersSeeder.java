package com.guilherme.consent.user;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class TestUsersSeeder implements ApplicationRunner {

	private static final List<TestUser> TEST_USERS = List.of(
			new TestUser("Admin", "admin@email.com", "admin123", UserRole.ADMIN),
			new TestUser("Maria", "maria@email.com", "maria123", UserRole.USER),
			new TestUser("João", "joao@email.com", "joao123", UserRole.USER));

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;

	public TestUsersSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
	}

	@Override
	public void run(ApplicationArguments arguments) {
		TEST_USERS.stream()
				.filter(testUser -> !userRepository.existsByEmail(testUser.email()))
				.map(this::toUser)
				.forEach(userRepository::save);
	}

	private User toUser(TestUser testUser) {
		String passwordHash = passwordEncoder.encode(testUser.password());
		return new User(testUser.name(), testUser.email(), passwordHash, testUser.role());
	}

	private record TestUser(String name, String email, String password, UserRole role) {
	}

}
