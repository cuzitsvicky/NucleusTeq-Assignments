package com.example.backend.security;

import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class AuthUtilTest {

    @InjectMocks
    private AuthUtil authUtil;

    private static final String TEST_SECRET = "my-super-secret-key-for-nexride-testing-purposes-only-32-chars";

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(authUtil, "SECRET_KEY", TEST_SECRET);
    }

    // ── generateToken ───────────────────────────────────────

    @Test
    void generateToken_success() {
        String token = authUtil.generateToken("john@example.com", "USER");

        assertThat(token).isNotNull();
        assertThat(token).isNotEmpty();
        assertThat(token).contains(".");
    }

    @Test
    void generateToken_generatesValidToken() {
        String token = authUtil.generateToken("john@example.com", "USER");

        assertThat(authUtil.validateToken(token)).isTrue();
    }

    @Test
    void generateToken_createsTokenForDifferentRoles() {
        String userToken = authUtil.generateToken("user@example.com", "USER");
        String adminToken = authUtil.generateToken("admin@example.com", "ADMIN");

        assertThat(authUtil.validateToken(userToken)).isTrue();
        assertThat(authUtil.validateToken(adminToken)).isTrue();
    }

    // ── extractUsername ─────────────────────────────────────

    @Test
    void extractUsername_success() {
        String token = authUtil.generateToken("john@example.com", "USER");

        String username = authUtil.extractUsername(token);

        assertThat(username).isEqualTo("john@example.com");
    }

    @Test
    void extractUsername_extractsCorrectEmail() {
        String testEmail = "admin@example.com";
        String token = authUtil.generateToken(testEmail, "ADMIN");

        String extracted = authUtil.extractUsername(token);

        assertThat(extracted).isEqualTo(testEmail);
    }

    // ── extractRole ─────────────────────────────────────────

    @Test
    void extractRole_success_userRole() {
        String token = authUtil.generateToken("john@example.com", "USER");

        String role = authUtil.extractRole(token);

        assertThat(role).isEqualTo("USER");
    }

    @Test
    void extractRole_success_adminRole() {
        String token = authUtil.generateToken("admin@example.com", "ADMIN");

        String role = authUtil.extractRole(token);

        assertThat(role).isEqualTo("ADMIN");
    }

    // ── extractClaims ───────────────────────────────────────

    @Test
    void extractClaims_returnsClaimsWithSubject() {
        String token = authUtil.generateToken("john@example.com", "USER");

        Claims claims = authUtil.extractClaims(token);

        assertThat(claims).isNotNull();
        assertThat(claims.getSubject()).isEqualTo("john@example.com");
    }

    @Test
    void extractClaims_returnsClaimsWithRole() {
        String token = authUtil.generateToken("john@example.com", "USER");

        Claims claims = authUtil.extractClaims(token);

        assertThat(claims.get("role")).isEqualTo("USER");
    }

    @Test
    void extractClaims_returnsMandatoryClaims() {
        String token = authUtil.generateToken("john@example.com", "USER");

        Claims claims = authUtil.extractClaims(token);

        assertThat(claims.getIssuedAt()).isNotNull();
        assertThat(claims.getExpiration()).isNotNull();
        assertThat(claims.getSubject()).isNotNull();
    }

    // ── validateToken ───────────────────────────────────────

    @Test
    void validateToken_success_validToken() {
        String token = authUtil.generateToken("john@example.com", "USER");

        boolean isValid = authUtil.validateToken(token);

        assertThat(isValid).isTrue();
    }

    @Test
    void validateToken_failure_invalidToken() {
        String invalidToken = "invalid.token.here";

        boolean isValid = authUtil.validateToken(invalidToken);

        assertThat(isValid).isFalse();
    }

    @Test
    void validateToken_failure_malformedToken() {
        String malformed = "malformed";

        boolean isValid = authUtil.validateToken(malformed);

        assertThat(isValid).isFalse();
    }

    @Test
    void validateToken_failure_emptyToken() {
        boolean isValid = authUtil.validateToken("");

        assertThat(isValid).isFalse();
    }

    @Test
    void validateToken_failure_nullToken() {
        boolean isValid = authUtil.validateToken(null);

        assertThat(isValid).isFalse();
    }

    // ── token consistency ───────────────────────────────────

    @Test
    void tokenConsistency_extractedValuesMatchOriginals() {
        String email = "consistency@example.com";
        String role = "ADMIN";
        String token = authUtil.generateToken(email, role);

        String extractedEmail = authUtil.extractUsername(token);
        String extractedRole = authUtil.extractRole(token);

        assertThat(extractedEmail).isEqualTo(email);
        assertThat(extractedRole).isEqualTo(role);
    }

    @Test
    void tokenConsistency_differentTokensForDifferentUsers() {
        String token1 = authUtil.generateToken("user1@example.com", "USER");
        String token2 = authUtil.generateToken("user2@example.com", "USER");

        assertThat(token1).isNotEqualTo(token2);

        String username1 = authUtil.extractUsername(token1);
        String username2 = authUtil.extractUsername(token2);

        assertThat(username1).isEqualTo("user1@example.com");
        assertThat(username2).isEqualTo("user2@example.com");
    }
}