package com.example.backend.model;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.*;

class UserTest {

    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
    }

    // ── getters and setters ─────────────────────────────────

    @Test
    void userId_canBeSet_andRetrieved() {
        user.setUserId(1L);

        assertThat(user.getUserId()).isEqualTo(1L);
    }

    @Test
    void username_canBeSet_andRetrieved() {
        user.setUsername("john_doe");

        assertThat(user.getUsername()).isEqualTo("john_doe");
    }

    @Test
    void email_canBeSet_andRetrieved() {
        user.setEmail("john@example.com");

        assertThat(user.getEmail()).isEqualTo("john@example.com");
    }

    @Test
    void password_canBeSet_andRetrieved() {
        user.setPassword("$2a$10$hashedpassword");

        assertThat(user.getPassword()).isEqualTo("$2a$10$hashedpassword");
    }

    @Test
    void role_canBeSet_andRetrieved() {
        user.setRole(User.Role.USER);

        assertThat(user.getRole()).isEqualTo(User.Role.USER);
    }

    @Test
    void createdAt_isNotNullByDefault() {
        assertThat(user.getCreatedAt()).isNotNull();
    }

    @Test
    void createdAt_isSetToCurrentTimeByDefault() {
        LocalDateTime before = LocalDateTime.now();
        User newUser = new User();
        LocalDateTime after = LocalDateTime.now();

        assertThat(newUser.getCreatedAt()).isAfterOrEqualTo(before);
        assertThat(newUser.getCreatedAt()).isBeforeOrEqualTo(after.plusSeconds(1));
    }

    // ── user role enum ──────────────────────────────────────

    @Test
    void userRole_hasUserValue() {
        assertThat(User.Role.USER).isNotNull();
    }

    @Test
    void userRole_hasAdminValue() {
        assertThat(User.Role.ADMIN).isNotNull();
    }

    @Test
    void userRole_canBeSetToUser() {
        user.setRole(User.Role.USER);

        assertThat(user.getRole()).isEqualTo(User.Role.USER);
    }

    @Test
    void userRole_canBeSetToAdmin() {
        user.setRole(User.Role.ADMIN);

        assertThat(user.getRole()).isEqualTo(User.Role.ADMIN);
    }

    // ── complex scenarios ───────────────────────────────────

    @Test
    void user_withAllFieldsSet() {
        user.setUserId(1L);
        user.setUsername("john_doe");
        user.setEmail("john@example.com");
        user.setPassword("$2a$10$hashedpassword");
        user.setRole(User.Role.USER);

        assertThat(user.getUserId()).isEqualTo(1L);
        assertThat(user.getUsername()).isEqualTo("john_doe");
        assertThat(user.getEmail()).isEqualTo("john@example.com");
        assertThat(user.getPassword()).isEqualTo("$2a$10$hashedpassword");
        assertThat(user.getRole()).isEqualTo(User.Role.USER);
        assertThat(user.getCreatedAt()).isNotNull();
    }

    @Test
    void adminUser_withAllFieldsSet() {
        user.setUserId(2L);
        user.setUsername("admin_user");
        user.setEmail("admin@example.com");
        user.setPassword("$2a$10$adminhashedpassword");
        user.setRole(User.Role.ADMIN);

        assertThat(user.getRole()).isEqualTo(User.Role.ADMIN);
        assertThat(user.getUsername()).isEqualTo("admin_user");
        assertThat(user.getEmail()).isEqualTo("admin@example.com");
    }

    @Test
    void user_roleCanBeChanged() {
        user.setRole(User.Role.USER);
        assertThat(user.getRole()).isEqualTo(User.Role.USER);

        user.setRole(User.Role.ADMIN);
        assertThat(user.getRole()).isEqualTo(User.Role.ADMIN);
    }

    @Test
    void user_emailCanBeUpdated() {
        user.setEmail("original@example.com");
        assertThat(user.getEmail()).isEqualTo("original@example.com");

        user.setEmail("updated@example.com");
        assertThat(user.getEmail()).isEqualTo("updated@example.com");
    }

    @Test
    void user_usernameCanBeUpdated() {
        user.setUsername("original_username");
        assertThat(user.getUsername()).isEqualTo("original_username");

        user.setUsername("updated_username");
        assertThat(user.getUsername()).isEqualTo("updated_username");
    }

    @Test
    void user_passwordCanBeUpdated() {
        user.setPassword("$2a$10$password1");
        assertThat(user.getPassword()).isEqualTo("$2a$10$password1");

        user.setPassword("$2a$10$password2");
        assertThat(user.getPassword()).isEqualTo("$2a$10$password2");
    }

    @Test
    void multipleUsers_haveIndependentState() {
        User user1 = new User();
        user1.setUserId(1L);
        user1.setUsername("user1");
        user1.setRole(User.Role.USER);

        User user2 = new User();
        user2.setUserId(2L);
        user2.setUsername("user2");
        user2.setRole(User.Role.ADMIN);

        assertThat(user1.getUserId()).isEqualTo(1L);
        assertThat(user1.getUsername()).isEqualTo("user1");
        assertThat(user1.getRole()).isEqualTo(User.Role.USER);

        assertThat(user2.getUserId()).isEqualTo(2L);
        assertThat(user2.getUsername()).isEqualTo("user2");
        assertThat(user2.getRole()).isEqualTo(User.Role.ADMIN);
    }
}