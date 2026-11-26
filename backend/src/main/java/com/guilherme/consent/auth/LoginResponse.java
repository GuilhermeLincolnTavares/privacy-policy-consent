package com.guilherme.consent.auth;

import com.guilherme.consent.user.UserRole;

public record LoginResponse(String token, String name, UserRole role) {
}
