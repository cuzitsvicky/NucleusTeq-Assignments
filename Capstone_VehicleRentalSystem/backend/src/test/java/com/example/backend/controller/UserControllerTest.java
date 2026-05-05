package com.example.backend.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.example.backend.dto.response.SignUpResponseDto;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.service.UserService;
import java.time.LocalDateTime;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

@ExtendWith(MockitoExtension.class)
class UserControllerTest {

    @Mock
    private UserService userService;

    @Mock
    private Authentication authentication;

    private UserController userController;

    @BeforeEach
    void setUp() {
        userController = new UserController(userService);
        when(authentication.getName()).thenReturn("user@example.com");
    }

    @Test
    void getCurrentUser_returnsServiceResponse() {
        SignUpResponseDto serviceResponse =
                new SignUpResponseDto(1L, "john", "user@example.com", "USER", LocalDateTime.now());

        when(userService.getCurrentUser("user@example.com")).thenReturn(serviceResponse);

        ResponseEntity<SignUpResponseDto> response = userController.getCurrentUser(authentication);

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody()).isSameAs(serviceResponse);
        verify(userService).getCurrentUser("user@example.com");
    }

    @Test
    void getCurrentUser_propagatesServiceException() {
        when(userService.getCurrentUser("user@example.com"))
                .thenThrow(new ResourceNotFoundException("User not found"));

        assertThatThrownBy(() -> userController.getCurrentUser(authentication))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("User not found");
    }
}
