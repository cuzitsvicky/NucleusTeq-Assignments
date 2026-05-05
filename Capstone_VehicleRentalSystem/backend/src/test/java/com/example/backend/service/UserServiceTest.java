package com.example.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import com.example.backend.dto.response.SignUpResponseDto;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.model.User;
import com.example.backend.repository.UserRepository;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    private UserService userService;
    private User user;

    @BeforeEach
    void setUp() {
        userService = new UserService(userRepository);
        user = user(1L, "john", "john@example.com", User.Role.USER);
    }

    @Test
    void findEntityByEmail_returnsUser() {
        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(user));

        User result = userService.findEntityByEmail("john@example.com");

        assertThat(result).isSameAs(user);
    }

    @Test
    void findEntityByEmail_throwsWhenMissing() {
        when(userRepository.findByEmail("missing@example.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.findEntityByEmail("missing@example.com"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("missing@example.com");
    }

    @Test
    void findEntityById_returnsUser() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        User result = userService.findEntityById(1L);

        assertThat(result).isSameAs(user);
    }

    @Test
    void findEntityById_throwsWhenMissing() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.findEntityById(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("99");
    }

    @Test
    void getCurrentUser_returnsProfileDto() {
        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(user));

        SignUpResponseDto result = userService.getCurrentUser("john@example.com");

        assertThat(result.getUserId()).isEqualTo(1L);
        assertThat(result.getUsername()).isEqualTo("john");
        assertThat(result.getEmail()).isEqualTo("john@example.com");
        assertThat(result.getRole()).isEqualTo("USER");
        assertThat(result.getCreatedAt()).isNotNull();
    }

    @Test
    void getCurrentUser_keepsAdminRole() {
        User admin = user(2L, "admin", "admin@example.com", User.Role.ADMIN);
        when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(admin));

        SignUpResponseDto result = userService.getCurrentUser("admin@example.com");

        assertThat(result.getRole()).isEqualTo("ADMIN");
    }

    private static User user(Long id, String username, String email, User.Role role) {
        User user = new User();
        user.setUserId(id);
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword("encoded-password");
        user.setRole(role);
        return user;
    }
}
