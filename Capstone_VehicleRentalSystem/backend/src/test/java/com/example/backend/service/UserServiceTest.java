package com.example.backend.service;

import com.example.backend.dto.response.SignUpResponseDto;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.model.User;
import com.example.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 *  UserServiceTest — Pure Unit Tests (no Spring context)
 *
 *  Tests the UserService in isolation by mocking UserRepository.
 *  Covers findEntityByEmail, findEntityById, and getCurrentUser methods,
 *  including both success scenarios and expected exceptions.
 */
@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    /**  Mocks */
    @Mock
    private UserRepository userRepository;

    /**  The class we are actually testing — all dependencies are mocked. */
    @InjectMocks
    private UserService userService;

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

    /** findEntityByEmail */

    @Test
    void findEntityByEmail_success() {
        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(sampleUser));

        User result = userService.findEntityByEmail("john@example.com");

        assertThat(result).isNotNull();
        assertThat(result.getEmail()).isEqualTo("john@example.com");
        assertThat(result.getUsername()).isEqualTo("john_doe");
    }

    @Test
    void findEntityByEmail_throwsResourceNotFoundException() {
        when(userRepository.findByEmail("unknown@example.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.findEntityByEmail("unknown@example.com"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("User not found")
                .hasMessageContaining("unknown@example.com");
    }

    /** findEntityById */

    @Test
    void findEntityById_success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));

        User result = userService.findEntityById(1L);

        assertThat(result).isNotNull();
        assertThat(result.getUserId()).isEqualTo(1L);
        assertThat(result.getUsername()).isEqualTo("john_doe");
    }

    @Test
    void findEntityById_throwsResourceNotFoundException() {
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.findEntityById(999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("User not found")
                .hasMessageContaining("999");
    }

    /** getCurrentUser */

    @Test
    void getCurrentUser_success() {
        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(sampleUser));

        SignUpResponseDto result = userService.getCurrentUser("john@example.com");

        assertThat(result).isNotNull();
        assertThat(result.getUserId()).isEqualTo(1L);
        assertThat(result.getUsername()).isEqualTo("john_doe");
        assertThat(result.getEmail()).isEqualTo("john@example.com");
        assertThat(result.getRole()).isEqualTo("USER");
        assertThat(result.getCreatedAt()).isNotNull();
    }

    @Test
    void getCurrentUser_returnsAdminRole_whenUserIsAdmin() {
        User adminUser = new User();
        adminUser.setUserId(2L);
        adminUser.setUsername("admin_user");
        adminUser.setEmail("admin@example.com");
        adminUser.setRole(User.Role.ADMIN);

        when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(adminUser));

        SignUpResponseDto result = userService.getCurrentUser("admin@example.com");

        assertThat(result.getRole()).isEqualTo("ADMIN");
    }

    @Test
    void getCurrentUser_throwsResourceNotFoundException() {
        when(userRepository.findByEmail("unknown@example.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.getCurrentUser("unknown@example.com"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("User not found");
    }
}