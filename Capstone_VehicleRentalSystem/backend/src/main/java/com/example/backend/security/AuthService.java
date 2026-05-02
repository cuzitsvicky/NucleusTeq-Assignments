package com.example.backend.security;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.backend.dto.request.LoginRequestDto;
import com.example.backend.dto.request.SignupRequestDto;
import com.example.backend.dto.response.LoginResponseDto;
import com.example.backend.dto.response.SignUpResponseDto;
import com.example.backend.exception.DuplicateResourceException;
import com.example.backend.exception.UnauthorizedException;
import com.example.backend.model.User;
import com.example.backend.repository.UserRepository;

/* AuthService is a service class responsible for handling authentication-related operations such as user registration and login.
 * It interacts with the UserRepository to manage user data, uses BCryptPasswordEncoder for password hashing, and AuthUtil for JWT token generation and validation.
 */
@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final AuthUtil authUtil;

    public AuthService(UserRepository userRepository, BCryptPasswordEncoder passwordEncoder, AuthUtil authUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authUtil = authUtil;
    }

    /* Handles user registration by validating the provided details and creating a new user in the database.
     * It checks for duplicate email addresses, hashes the password, assigns a role, and returns a SignUpResponseDto with the created user's details.
     * This method is used to allow new users to sign up for the application and create their accounts.
     */
    public SignUpResponseDto signup(SignupRequestDto dto) {
        log.info("Signup attempt for email: {}", dto.getEmail());

        if (userRepository.existsByEmail(dto.getEmail())) {
            log.warn("Signup failed — email already registered: {}", dto.getEmail());
            throw new DuplicateResourceException("Email already exists");
        }

        User user = new User();
        user.setUsername(dto.getUsername());
        user.setEmail(dto.getEmail());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setRole(User.Role.USER);

        User saved = userRepository.save(user);
        log.info("User registered successfully — userId: {}, email: {}, role: {}",
                saved.getUserId(), saved.getEmail(), saved.getRole());

        return new SignUpResponseDto(saved.getUserId(), saved.getUsername(), saved.getEmail(), saved.getRole().name(),
                saved.getCreatedAt());
    }

    /* Handles user login by validating the provided credentials. If the email and password are correct, it generates a JWT token and returns a LoginResponseDto containing the token and user details.
     * This method is used to authenticate users and provide them with a token for subsequent authenticated requests in the application.
     */
    public LoginResponseDto login(LoginRequestDto dto) {
        log.info("Login attempt for email: {}", dto.getEmail());

        User user = userRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> {
                    log.warn("Login failed — no account found for email: {}", dto.getEmail());
                    return new UnauthorizedException("Invalid email or password");
                });

        if (!passwordEncoder.matches(dto.getPassword(), user.getPassword())) {
            log.warn("Login failed — incorrect password for email: {}", dto.getEmail());
            throw new UnauthorizedException("Invalid email or password");
        }

        String token = authUtil.generateToken(user.getEmail(), user.getRole().name());
        log.info("Login successful — userId: {}, email: {}, role: {}",
                user.getUserId(), user.getEmail(), user.getRole());

        return new LoginResponseDto(
                token,
                user.getUserId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole().name());
    }
}