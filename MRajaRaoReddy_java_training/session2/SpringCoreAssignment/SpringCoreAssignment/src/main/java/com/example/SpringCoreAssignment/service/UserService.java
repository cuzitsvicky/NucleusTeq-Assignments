package com.example.SpringCoreAssignment.service;

import java.util.List;

import org.springframework.stereotype.Service;

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


    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(int id) {
        User user = userRepository.findById(id);

        if (user == null) {
            throw new UserNotFoundException("User not found with id: " + id);
        }

        return user;
    }

    public void createUser(User user) {
        userRepository.save(user);
    }

    public User updateUser(int id, User user) {
        User existingUser = userRepository.findById(id);

        if (existingUser == null) {
            throw new RuntimeException("User not found with id: " + id);
        }

        return userRepository.update(id, user);
    }

    public String deleteUser(int id) {

        boolean deleted = userRepository.deleteUser(id);

        if (!deleted) {
            throw new RuntimeException("User not found with id: " + id);
        }

        return "User deleted successfully";
    }
}
