package com.example.backend.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import java.io.IOException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;

@ExtendWith(MockitoExtension.class)
class JwtAuthFilterTest {

    @Mock
    private AuthUtil authUtil;

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void doFilter_withoutBearerToken_continuesWithoutAuthentication() throws Exception {
        JwtAuthFilter filter = new JwtAuthFilter(authUtil);
        MockHttpServletRequest request = request();
        MockHttpServletResponse response = new MockHttpServletResponse();
        CountingFilterChain chain = new CountingFilterChain();

        filter.doFilter(request, response, chain);

        assertThat(chain.calls).isEqualTo(1);
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(authUtil, never()).validateToken(org.mockito.ArgumentMatchers.anyString());
    }

    @Test
    void doFilter_withInvalidBearerToken_continuesWithoutAuthentication() throws Exception {
        JwtAuthFilter filter = new JwtAuthFilter(authUtil);
        MockHttpServletRequest request = request();
        request.addHeader("Authorization", "Bearer bad-token");
        MockHttpServletResponse response = new MockHttpServletResponse();
        CountingFilterChain chain = new CountingFilterChain();

        when(authUtil.validateToken("bad-token")).thenReturn(false);

        filter.doFilter(request, response, chain);

        assertThat(chain.calls).isEqualTo(1);
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(authUtil, never()).extractUsername("bad-token");
        verify(authUtil, never()).extractRole("bad-token");
    }

    @Test
    void doFilter_withValidBearerToken_setsAuthentication() throws Exception {
        JwtAuthFilter filter = new JwtAuthFilter(authUtil);
        MockHttpServletRequest request = request();
        request.addHeader("Authorization", "Bearer valid-token");
        MockHttpServletResponse response = new MockHttpServletResponse();
        CountingFilterChain chain = new CountingFilterChain();

        when(authUtil.validateToken("valid-token")).thenReturn(true);
        when(authUtil.extractUsername("valid-token")).thenReturn("john@example.com");
        when(authUtil.extractRole("valid-token")).thenReturn("USER");

        filter.doFilter(request, response, chain);

        assertThat(chain.calls).isEqualTo(1);
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNotNull();
        assertThat(SecurityContextHolder.getContext().getAuthentication().getPrincipal())
                .isEqualTo("john@example.com");
        assertThat(SecurityContextHolder.getContext().getAuthentication().getAuthorities())
                .extracting("authority")
                .containsExactly("ROLE_USER");
    }

    private static MockHttpServletRequest request() {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/bookings/my-bookings");
        request.setServletPath("/api/bookings/my-bookings");
        return request;
    }

    private static class CountingFilterChain implements FilterChain {
        private int calls;

        @Override
        public void doFilter(ServletRequest request, ServletResponse response) throws IOException {
            calls++;
        }
    }
}
