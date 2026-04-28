package com.example.backend.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.backend.model.User;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    /* Finds a user by their email address. This method is used to retrieve user details during authentication and other operations that require fetching a user by email.
     * It returns an Optional containing the User entity if found, or an empty Optional if no user with the specified email exists.
     */
    Optional<User> findByEmail(String email);
    
    /* Checks if a user with the given email already exists in the database. This method is used to prevent duplicate email registrations during user sign-up.
     * It returns true if a user with the specified email exists, and false otherwise.
     */
    boolean existsByEmail(String email);
}
