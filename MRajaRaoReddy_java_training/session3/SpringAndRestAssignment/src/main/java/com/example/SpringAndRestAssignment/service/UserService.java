package com.example.SpringAndRestAssignment.service;
import java.util.*;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import com.example.SpringAndRestAssignment.dto.UserRequest;
import com.example.SpringAndRestAssignment.exception.BadRequestException;
import com.example.SpringAndRestAssignment.model.User;
import com.example.SpringAndRestAssignment.repository.UserRepository;


// UserService class
// This class contains the business logic for handling user-related operations such as searching, submitting, and
@Service
public class UserService {

    // Dependency on UserRepository to manage user data
    private final UserRepository repository;

    // Constructor to inject the UserRepository dependency
    public UserService(UserRepository repository) {
        this.repository = repository;
    }

    // Method to search users based on optional criteria: name, age, and role
    public List<User> searchUsers(String name, Integer age, String role) {

        return repository.findAll().stream()
                .filter(u -> name == null || u.getName().equalsIgnoreCase(name))
                .filter(u -> age == null || u.getAge().equals(age))
                .filter(u -> role == null || u.getRole().equalsIgnoreCase(role))
                .collect(Collectors.toList());
    }

    // Method to submit a new user based on the data received in the UserRequest DTO
    public void submitUser(UserRequest request) {

        if (request.getName() == null || request.getName().isEmpty()) {
            throw new BadRequestException("Name cannot be empty");
        }

        if (request.getAge() == null) {
            throw new BadRequestException("Age is required");
        }

        if (request.getRole() == null || request.getRole().isEmpty()) {
            throw new BadRequestException("Role cannot be empty");
        }

        User user = new User(
                UUID.randomUUID().getMostSignificantBits() & Long.MAX_VALUE,
                request.getName(),
                request.getAge(),
                request.getRole());

        repository.addUser(user);
    }

    // Method to delete a user by ID with confirmation
    public String deleteUser(Long id, Boolean confirm) {

        if (confirm == null || !confirm) {

            throw new BadRequestException("Confirmation required");
        }

        User user = repository.findById(id)
                .orElseThrow(() -> new BadRequestException("User not found"));

        repository.delete(user);

        return "User deleted successfully";
    }
}