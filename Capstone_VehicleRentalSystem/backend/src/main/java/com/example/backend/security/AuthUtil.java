package com.example.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Value;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

/* AuthUtil is a utility class for handling JWT token generation, validation, and extraction of claims such as email and role.
 * It uses the configured secret key to sign and verify JWT tokens, ensuring secure authentication and authorization in the application.
 */
@Component
public class AuthUtil {

    private static final Logger log = LoggerFactory.getLogger(AuthUtil.class);

    @Value("${jwt.secretKey}")
    private String SECRET_KEY;
    private static final long EXPIRATION_TIME = 1000 * 60 * 60 * 10;

    /* Retrieves the secret key for signing JWT tokens. */
    private Key getKey() {
        return Keys.hmacShaKeyFor(SECRET_KEY.getBytes(StandardCharsets.UTF_8));
    }

    /* Generates a JWT token for the given email and role. */
    public String generateToken(String email, String role) {
        log.debug("Generating JWT token for email: {}, role: {}", email, role);
        String token = Jwts.builder()
                .subject(email)
                .claim("role", role)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(getKey())
                .compact();
        log.debug("JWT token generated successfully for email: {}", email);
        return token;
    }

    /* Extracts the claims from the provided JWT token. */
    public Claims extractClaims(String token) {
        return Jwts.parser()
                .verifyWith((javax.crypto.SecretKey) getKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /* Extracts the email from the JWT token subject. */
    public String extractEmail(String token) {
        String email = extractClaims(token).getSubject();
        log.debug("Extracted email from JWT: {}", email);
        return email;
    }

    /* Extracts the user's role from the JWT token. */
    public String extractRole(String token) {
        String role = extractClaims(token).get("role", String.class);
        log.debug("Extracted role from JWT: {}", role);
        return role;
    }

    /* Validates the provided JWT token. */
    public boolean validateToken(String token) {
        try {
            extractClaims(token);
            log.debug("JWT token validation successful");
            return true;
        } catch (Exception ex) {
            log.warn("JWT token validation failed: {}", ex.getMessage());
            return false;
        }
    }
}
