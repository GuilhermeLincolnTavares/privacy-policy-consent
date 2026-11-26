package com.guilherme.consent.consent;

import com.guilherme.consent.policy.PrivacyPolicy;
import com.guilherme.consent.policy.PrivacyPolicyRepository;
import com.guilherme.consent.user.User;
import com.guilherme.consent.user.UserRepository;
import com.guilherme.consent.user.UserRole;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
class ConsentServiceConcurrencyTest {

	private static final int CONCURRENT_REQUESTS = 8;
	private static final int REQUEST_TIMEOUT_SECONDS = 30;

	@Autowired
	private ConsentService consentService;

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private PrivacyPolicyRepository policyRepository;

	@Autowired
	private PrivacyConsentRepository consentRepository;

	private User user;

	@BeforeEach
	void createUser() {
		String uniqueEmail = UUID.randomUUID() + "@test.local";
		user = userRepository.save(new User("Concurrency Test", uniqueEmail, "hash", UserRole.USER));
	}

	@AfterEach
	void deleteUser() {
		userRepository.deleteById(user.getId());
	}

	@Test
	void simultaneousAcceptsStoreTheConsentWithoutAnyRequestFailing() throws InterruptedException {
		ExecutorService executor = Executors.newFixedThreadPool(CONCURRENT_REQUESTS);
		CountDownLatch startSignal = new CountDownLatch(1);
		List<Future<Void>> requests = new ArrayList<>();
		for (int request = 0; request < CONCURRENT_REQUESTS; request++) {
			requests.add(executor.submit(() -> {
				startSignal.await();
				consentService.acceptCurrentPolicy(user.getId());
				return null;
			}));
		}

		startSignal.countDown();

		for (Future<Void> request : requests) {
			assertDoesNotThrow(() -> {
				request.get(REQUEST_TIMEOUT_SECONDS, TimeUnit.SECONDS);
			});
		}
		executor.shutdown();
		PrivacyPolicy currentPolicy = policyRepository.findCurrentPolicy().orElseThrow();
		assertTrue(consentRepository.existsByUserIdAndPolicyId(user.getId(), currentPolicy.getId()));
	}

}
