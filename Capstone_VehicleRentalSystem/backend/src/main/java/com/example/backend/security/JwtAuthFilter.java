package com.example.backend.security;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.Collections;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {
    
    private final AuthUtil authUtil;

    public JwtAuthFilter(AuthUtil authUtil) {
        this.authUtil = authUtil;
    }

    /* Filter that intercepts incoming HTTP requests to validate JWT tokens. Extracts the token from the Authorization header,
     * validates it, and if valid, sets the authentication in the security context with the user's details and roles.
     * This filter is executed once per request and ensures that only authenticated users can access protected endpoints.
     */
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);

        if (authUtil.validateToken(token)) {
            String username = authUtil.extractUsername(token);

            String role = authUtil.extractRole(token);

            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                    username, null, Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role)));

            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        /* Continue the filter chain after processing the JWT token. 
         * If the token is valid, the security context will be set with the authenticated user's details, allowing access to protected endpoints.
         * If the token is invalid or missing, the request will proceed without authentication, and access to protected endpoints will be denied.
         */
        filterChain.doFilter(request, response);
    }
}
