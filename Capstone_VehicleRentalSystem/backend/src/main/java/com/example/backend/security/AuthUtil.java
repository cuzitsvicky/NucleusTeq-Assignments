package com.example.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Value;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

/* AuthUtil is a utility class for handling JWT token generation, validation, and extraction of claims such as username and role.
 * It uses the configured secret key to sign and verify JWT tokens, ensuring secure authentication and authorization in the application.
 */
@Component
public class AuthUtil {
    
    @Value("${jwt.secretKey}")
    private String SECRET_KEY;
    private static final long EXPIRATION_TIME = 1000 * 60 * 60 * 10;

    /* Retrieves the secret key for signing JWT tokens. The key is generated using the HMAC SHA algorithm and is derived from the configured secret key string.
     * This method is used internally to obtain the signing key for generating and validating JWT tokens in the application.
     */
    private Key getKey() {
        return Keys.hmacShaKeyFor(SECRET_KEY.getBytes(StandardCharsets.UTF_8));
    }

    /* Generates a JWT token for the given username and role. The token includes the username as the subject and the role as a claim, along with issued and expiration timestamps.
     * This method is used to create a JWT token that can be returned to the client upon successful authentication, allowing the client to use the token for subsequent authenticated requests.
     */
    public String generateToken(String username, String role) {
        return Jwts.builder()
                .subject(username)
                .claim("role", role)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(getKey())
                .compact();
    }

    /* Extracts the claims from the provided JWT token using the secret key. This method is used to retrieve the payload of the token, which contains information such as the username and role.
     * It is essential for validating the token and extracting user details for authentication and authorization purposes in the application.
     */
    public Claims extractClaims(String token) {
        return Jwts.parser().verifyWith((javax.crypto.SecretKey) getKey()).build().parseSignedClaims(token)
                .getPayload();
    }

    /* Extracts the username (email) from the JWT token by retrieving the subject claim from the token's claims. 
     * This method is used to identify the authenticated user based on the information contained in the JWT token.
     */
    public String extractUsername(String token) {
        return extractClaims(token).getSubject();
    }

    /* Extracts the user's role from the JWT token by retrieving the "role" claim from the token's claims. 
     * This method is used to determine the user's role for authorization purposes in the application.
     */
    public String extractRole(String token) {
        return extractClaims(token).get("role", String.class);
    }

    /* Validates the provided JWT token by attempting to extract claims. If the token is valid, it returns true; otherwise, it catches any exceptions and returns false.
     * This method is used to ensure that only valid tokens are accepted for authentication and authorization purposes in the application.
     */
    public boolean validateToken(String token) {
        try {
            extractClaims(token);
            return true;
        } catch (Exception ex) {
            return false;
        }
    }
}
