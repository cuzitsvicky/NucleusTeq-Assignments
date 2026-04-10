package com.example.SpringCoreAssignment.service;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.example.SpringCoreAssignment.exception.DuplicateUserException;
import com.example.SpringCoreAssignment.exception.UserNotFoundException;
import com.example.SpringCoreAssignment.model.User;
import com.example.SpringCoreAssignment.repository.UserRepository;

@Service
public class UserService {

    private  final UserRepository userRepository;

    // Constructor Injection
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }


    // method to get all users
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // method to get user by ID
    public User getUserById(int id) {
        User user = userRepository.findById(id);

        if (user == null) {
            throw new UserNotFoundException("User not found with id: " + id);
        }

        return user;
    }

    // method to create a new user
    public void createUser(User user) {
        User existingUser = userRepository.findById(user.getId());

        if (existingUser != null) {
            throw new DuplicateUserException("User already exists with id: " + user.getId());
        }

        userRepository.save(user);
    }

    // method to update user by ID
    public User updateUser(int id, User user) {
        User existingUser = userRepository.findById(id);

        if (existingUser == null) {
            throw new RuntimeException("User not found with id: " + id);
        }

        return userRepository.update(id, user);
    }

    // method to delete user by ID
    public String deleteUser(int id) {

        boolean deleted = userRepository.deleteUser(id);

        if (!deleted) {
          throw new UserNotFoundException("User not found with id: " + id);
        }

        return "User deleted successfully";
    }

    // method to patch update user by ID
    public User patchUpdateUser(int id, Map<String, Object> updates) {

        User existingUser = userRepository.findById(id);

        if (existingUser == null) {
            throw new UserNotFoundException("User not found with id: " + id);
        }

        if (updates.containsKey("name")) {
            existingUser.setName((String) updates.get("name"));
        }

        if (updates.containsKey("email")) {
            existingUser.setEmail((String) updates.get("email"));
        }

        return existingUser;
    }
}
