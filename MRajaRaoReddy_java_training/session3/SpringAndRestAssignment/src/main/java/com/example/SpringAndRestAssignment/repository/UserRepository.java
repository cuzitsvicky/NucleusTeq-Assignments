package com.example.SpringAndRestAssignment.repository;
import java.util.*;
import org.springframework.stereotype.Repository;
import com.example.SpringAndRestAssignment.model.User;

// UserRepository class
// This class simulates a repository for managing user data in-memory
@Repository
public class UserRepository {

    private final List<User> users = new ArrayList<>();

    // Initialize with some sample users
    public UserRepository() {
        users.add(new User(1L, "Priya", 25, "USER"));
        users.add(new User(2L, "Rahul", 30, "ADMIN"));
        users.add(new User(3L, "Amit", 30, "USER"));
        users.add(new User(4L, "Sneha", 28, "USER"));
        users.add(new User(5L, "Vikas", 35, "MANAGER"));
        users.add(new User(6L, "Neha", 30, "USER"));
    }

    // Repository methods for CRUD operations
    public List<User> findAll() {
        return users;
    }

    
    public Optional<User> findById(Long id) {
        return users.stream()
                .filter(u -> u.getId().equals(id))
                .findFirst();
    }

    
    public void addUser(User user) {
        users.add(user);
    }

    
    public void delete(User user) {
        users.remove(user);
    }
}
