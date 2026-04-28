package com.example.backend.security;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import com.example.backend.repository.UserRepository;
import com.example.backend.model.User;

import java.util.Collections;

/* CustomUserDetailsService is a service that implements Spring Security's UserDetailsService interface.
 * It is responsible for loading user details from the database based on the provided email during authentication.
 * It retrieves the user entity and converts it into a UserDetails object that Spring Security can use for authentication and authorization.
 */
@Service
public class CustomUserDetailsService implements UserDetailsService {
    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /* Loads a user by their email for authentication purposes. Validates that the user exists and returns a UserDetails object containing the user's credentials and authorities.
     * This method is used by Spring Security during the authentication process to retrieve user information based on the provided email.
     */
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
         User user = userRepository.findByEmail(email)          
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
 
        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),                             
                user.getPassword(),
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())));
    }
    
}
