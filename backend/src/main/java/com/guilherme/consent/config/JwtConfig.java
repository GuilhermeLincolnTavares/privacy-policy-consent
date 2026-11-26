package com.guilherme.consent.config;

import com.nimbusds.jose.jwk.source.ImmutableSecret;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;

@Configuration
@EnableConfigurationProperties(JwtProperties.class)
public class JwtConfig {

	private static final String HMAC_SHA256_ALGORITHM = "HmacSHA256";

	@Bean
	public JwtEncoder jwtEncoder(JwtProperties jwtProperties) {
		return new NimbusJwtEncoder(new ImmutableSecret<>(secretKey(jwtProperties)));
	}

	@Bean
	public JwtDecoder jwtDecoder(JwtProperties jwtProperties) {
		return NimbusJwtDecoder.withSecretKey(secretKey(jwtProperties))
				.macAlgorithm(MacAlgorithm.HS256)
				.build();
	}

	private SecretKey secretKey(JwtProperties jwtProperties) {
		byte[] secretBytes = jwtProperties.secret().getBytes(StandardCharsets.UTF_8);
		return new SecretKeySpec(secretBytes, HMAC_SHA256_ALGORITHM);
	}

}
