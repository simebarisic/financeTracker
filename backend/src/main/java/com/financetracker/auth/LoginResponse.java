package com.financetracker.auth;

public record LoginResponse(
        String token,
        String username
) {
}
