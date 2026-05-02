package com.example.backend.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.backend.model.User;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    /* Finds a user by their email address. */
    Optional<User> findByEmail(String email);
    
    /* Checks if a user with the given email already exists in the database. */
    boolean existsByEmail(String email);
}
