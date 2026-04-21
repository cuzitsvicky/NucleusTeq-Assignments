package com.example.backend.security;

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

@Service
public class AuthService {
    
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final AuthUtil authUtil;

    public AuthService(UserRepository userRepository, BCryptPasswordEncoder passwordEncoder, AuthUtil authUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authUtil = authUtil;
    }

    public SignUpResponseDto signup(SignupRequestDto dto) {
        if (userRepository.existsByUsername(dto.getUsername())) {
            throw new DuplicateResourceException("Username already exists");
        }
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new DuplicateResourceException("Email already exists");
        }
        User user = new User();
        user.setUsername(dto.getUsername());
        user.setEmail(dto.getEmail());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setRole(
                dto.getRole() != null && dto.getRole().equalsIgnoreCase("ADMIN") ? User.Role.ADMIN : User.Role.USER);
        User saved = userRepository.save(user);
        return new SignUpResponseDto(saved.getUserId(), saved.getUsername(), saved.getEmail(), saved.getRole().name(),
                saved.getCreatedAt());
    }

    public LoginResponseDto login(LoginRequestDto dto) {
        User user = userRepository.findByUsername(dto.getUsername())
                .orElseThrow(() -> new UnauthorizedException("Invalid username or password"));
        if (!passwordEncoder.matches(dto.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("Invalid username or password");
        }
        String token = authUtil.generateToken(user.getUsername(), user.getRole().name());
        return new LoginResponseDto(token, user.getUserId(), user.getUsername(), user.getEmail(),
                user.getRole().name());
    }
}
