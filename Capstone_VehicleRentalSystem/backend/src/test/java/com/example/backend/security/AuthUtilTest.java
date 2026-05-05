package com.example.backend.security;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

class AuthUtilTest {

    private AuthUtil authUtil;

    @BeforeEach
    void setUp() {
        authUtil = new AuthUtil();
        ReflectionTestUtils.setField(authUtil, "SECRET_KEY", "01234567890123456789012345678901");
    }

    @Test
    void generateToken_containsUsernameAndRole() {
        String token = authUtil.generateToken("john@example.com", "USER");

        assertThat(token).isNotBlank();
        assertThat(authUtil.extractUsername(token)).isEqualTo("john@example.com");
        assertThat(authUtil.extractRole(token)).isEqualTo("USER");
        assertThat(authUtil.validateToken(token)).isTrue();
    }

    @Test
    void validateToken_returnsFalseForInvalidToken() {
        assertThat(authUtil.validateToken("not-a-valid-token")).isFalse();
    }
}
