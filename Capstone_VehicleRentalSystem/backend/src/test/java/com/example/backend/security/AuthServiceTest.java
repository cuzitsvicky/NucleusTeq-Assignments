package com.example.backend.security;

import com.example.backend.dto.request.LoginRequestDto;
import com.example.backend.dto.request.SignupRequestDto;
import com.example.backend.dto.response.LoginResponseDto;
import com.example.backend.dto.response.SignUpResponseDto;
import com.example.backend.exception.DuplicateResourceException;
import com.example.backend.exception.UnauthorizedException;
import com.example.backend.model.User;
import com.example.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 *  AuthServiceTest — Pure Unit Tests (no Spring context)
 *
 *  Tests the AuthService in isolation by mocking UserRepository, BCryptPasswordEncoder, and AuthUtil.
 *  Covers both signup and login functionalities, including success scenarios and expected exceptions.
 */
@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    /**  Mocks */
    @Mock
    private UserRepository userRepository;

    @Mock
    private BCryptPasswordEncoder passwordEncoder;

    @Mock
    private AuthUtil authUtil;

    /**  The class we are actually testing — all dependencies are mocked. */
    @InjectMocks
    private AuthService authService;

    /**  Sample user data for testing */
    private User sampleUser;

    /**  Setup method to initialize common test data */
    @BeforeEach
    void setUp() {
        sampleUser = new User();
        sampleUser.setUserId(1L);
        sampleUser.setUsername("john_doe");
        sampleUser.setEmail("john@example.com");
        sampleUser.setPassword("$2a$10$hashedpassword");
        sampleUser.setRole(User.Role.USER);
    }

    /** signup */

    @Test
    void signup_success_withDefaultUserRole() {
        SignupRequestDto dto = new SignupRequestDto();
        dto.setUsername("john_doe");
        dto.setEmail("john@example.com");
        dto.setPassword("secret123");

        when(userRepository.existsByEmail("john@example.com")).thenReturn(false);
        when(passwordEncoder.encode("secret123")).thenReturn("$2a$10$hashed");
        when(userRepository.save(any(User.class))).thenReturn(sampleUser);

        SignUpResponseDto result = authService.signup(dto);

        assertThat(result).isNotNull();
        assertThat(result.getEmail()).isEqualTo("john@example.com");
        assertThat(result.getRole()).isEqualTo("USER");

        verify(userRepository).existsByEmail("john@example.com");
        verify(passwordEncoder).encode("secret123");
        verify(userRepository).save(any(User.class));
    }

    @Test
    void signup_success_withAdminRole() {
        SignupRequestDto dto = new SignupRequestDto();
        dto.setUsername("admin_user");
        dto.setEmail("admin@example.com");
        dto.setPassword("adminpass");
        dto.setRole("ADMIN");

        User adminUser = new User();
        adminUser.setUserId(2L);
        adminUser.setUsername("admin_user");
        adminUser.setEmail("admin@example.com");
        adminUser.setPassword("$2a$10$hashed");
        adminUser.setRole(User.Role.ADMIN);

        when(userRepository.existsByEmail("admin@example.com")).thenReturn(false);
        when(passwordEncoder.encode("adminpass")).thenReturn("$2a$10$hashed");
        when(userRepository.save(any(User.class))).thenReturn(adminUser);

        SignUpResponseDto result = authService.signup(dto);

        assertThat(result.getRole()).isEqualTo("ADMIN");
    }

    @Test
    void signup_throwsDuplicateResourceException_whenEmailAlreadyExists() {
        SignupRequestDto dto = new SignupRequestDto();
        dto.setUsername("john_doe");
        dto.setEmail("john@example.com");
        dto.setPassword("secret123");

        when(userRepository.existsByEmail("john@example.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.signup(dto))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("Email already exists");

        verify(userRepository, never()).save(any());
    }

    @Test
    void signup_defaultsToUserRole_whenRoleIsNull() {
        SignupRequestDto dto = new SignupRequestDto();
        dto.setUsername("testuser");
        dto.setEmail("test@example.com");
        dto.setPassword("pass123");
        dto.setRole(null);

        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("hashed");
        when(userRepository.save(any(User.class))).thenReturn(sampleUser);

        SignUpResponseDto result = authService.signup(dto);

        assertThat(result).isNotNull();
    }

    /** login */
    @Test
    void login_success_returnsTokenAndUserDetails() {
        LoginRequestDto dto = new LoginRequestDto();
        dto.setEmail("john@example.com");
        dto.setPassword("secret123");

        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("secret123", "$2a$10$hashedpassword")).thenReturn(true);
        when(authUtil.generateToken("john@example.com", "USER")).thenReturn("jwt-token-xyz");

        LoginResponseDto result = authService.login(dto);

        assertThat(result).isNotNull();
        assertThat(result.getToken()).isEqualTo("jwt-token-xyz");
        assertThat(result.getUserId()).isEqualTo(1L);
        assertThat(result.getUsername()).isEqualTo("john_doe");
        assertThat(result.getEmail()).isEqualTo("john@example.com");
        assertThat(result.getRole()).isEqualTo("USER");
    }

    /* This test checks that if the email is not found in the database, an UnauthorizedException is thrown,
       and that the password encoder's matches method is never called. */
    @Test
    void login_throwsUnauthorizedException_whenEmailNotFound() {
        LoginRequestDto dto = new LoginRequestDto();
        dto.setEmail("unknown@example.com");
        dto.setPassword("secret123");

        when(userRepository.findByEmail("unknown@example.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(dto))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("Invalid email or password");

        verify(passwordEncoder, never()).matches(any(), any());
    }

    /* This test checks that if the password is incorrect, an UnauthorizedException is thrown,
       and that the token generation method is never called. */
    @Test
    void login_throwsUnauthorizedException_whenPasswordIncorrect() {
        LoginRequestDto dto = new LoginRequestDto();
        dto.setEmail("john@example.com");
        dto.setPassword("wrongpassword");

        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("wrongpassword", "$2a$10$hashedpassword")).thenReturn(false);

        assertThatThrownBy(() -> authService.login(dto))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("Invalid email or password");

        verify(authUtil, never()).generateToken(any(), any());
    }
}