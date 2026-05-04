package com.example.backend.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.example.backend.dto.request.LoginRequestDto;
import com.example.backend.dto.request.SignupRequestDto;
import com.example.backend.dto.response.LoginResponseDto;
import com.example.backend.dto.response.SignUpResponseDto;
import com.example.backend.exception.DuplicateResourceException;
import com.example.backend.exception.UnauthorizedException;
import com.example.backend.model.User;
import com.example.backend.repository.UserRepository;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private BCryptPasswordEncoder passwordEncoder;

    @Mock
    private AuthUtil authUtil;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(userRepository, passwordEncoder, authUtil);
    }

    @Test
    void signup_savesUserWithEncodedPasswordAndUserRole() {
        SignupRequestDto request = new SignupRequestDto();
        request.setUsername("john_doe");
        request.setEmail("john@example.com");
        request.setPassword("secret123");

        User savedUser = user(1L, "john_doe", "john@example.com", "encoded-password", User.Role.USER);

        when(userRepository.existsByEmail("john@example.com")).thenReturn(false);
        when(passwordEncoder.encode("secret123")).thenReturn("encoded-password");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        SignUpResponseDto response = authService.signup(request);

        assertThat(response.getUserId()).isEqualTo(1L);
        assertThat(response.getUsername()).isEqualTo("john_doe");
        assertThat(response.getEmail()).isEqualTo("john@example.com");
        assertThat(response.getRole()).isEqualTo("USER");

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        assertThat(userCaptor.getValue().getPassword()).isEqualTo("encoded-password");
        assertThat(userCaptor.getValue().getRole()).isEqualTo(User.Role.USER);
    }

    @Test
    void signup_existingEmail_throwsDuplicateResourceException() {
        SignupRequestDto request = new SignupRequestDto();
        request.setEmail("john@example.com");

        when(userRepository.existsByEmail("john@example.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.signup(request))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessage("Email already exists");

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void login_validCredentials_returnsTokenAndUserDetails() {
        LoginRequestDto request = new LoginRequestDto();
        request.setEmail("admin@example.com");
        request.setPassword("secret123");

        User admin = user(2L, "admin_user", "admin@example.com", "encoded-password", User.Role.ADMIN);

        when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(admin));
        when(passwordEncoder.matches("secret123", "encoded-password")).thenReturn(true);
        when(authUtil.generateToken("admin@example.com", "ADMIN")).thenReturn("jwt-token");

        LoginResponseDto response = authService.login(request);

        assertThat(response.getToken()).isEqualTo("jwt-token");
        assertThat(response.getUserId()).isEqualTo(2L);
        assertThat(response.getUsername()).isEqualTo("admin_user");
        assertThat(response.getEmail()).isEqualTo("admin@example.com");
        assertThat(response.getRole()).isEqualTo("ADMIN");
    }

    @Test
    void login_unknownEmail_throwsUnauthorizedException() {
        LoginRequestDto request = new LoginRequestDto();
        request.setEmail("missing@example.com");

        when(userRepository.findByEmail("missing@example.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessage("Invalid email or password");
    }

    @Test
    void login_wrongPassword_throwsUnauthorizedException() {
        LoginRequestDto request = new LoginRequestDto();
        request.setEmail("john@example.com");
        request.setPassword("wrong");

        User user = user(1L, "john_doe", "john@example.com", "encoded-password", User.Role.USER);

        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong", "encoded-password")).thenReturn(false);

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessage("Invalid email or password");

        verify(authUtil, never()).generateToken(any(), any());
    }

    private static User user(Long id, String username, String email, String password, User.Role role) {
        User user = new User();
        user.setUserId(id);
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(password);
        user.setRole(role);
        return user;
    }
}
