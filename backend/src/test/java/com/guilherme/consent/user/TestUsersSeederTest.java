package com.guilherme.consent.user;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest
class TestUsersSeederTest {

	@Autowired
	private TestUsersSeeder testUsersSeeder;

	@Autowired
	private UserRepository userRepository;

	@Test
	void createsTheAdminAndTheRegularTestUsers() {
		assertEquals(UserRole.ADMIN, userRepository.findByEmail("admin@email.com").orElseThrow().getRole());
		assertEquals(UserRole.USER, userRepository.findByEmail("maria@email.com").orElseThrow().getRole());
		assertEquals(UserRole.USER, userRepository.findByEmail("joao@email.com").orElseThrow().getRole());
	}

	@Test
	void runningTwiceDoesNotDuplicateTheTestUsers() {
		long usersBefore = userRepository.count();

		testUsersSeeder.run(null);

		assertEquals(usersBefore, userRepository.count());
	}

}
