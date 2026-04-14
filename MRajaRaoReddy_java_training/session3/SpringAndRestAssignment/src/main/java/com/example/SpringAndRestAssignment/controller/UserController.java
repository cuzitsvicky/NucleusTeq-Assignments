package com.example.SpringAndRestAssignment.controller;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import com.example.SpringAndRestAssignment.dto.UserRequest;
import com.example.SpringAndRestAssignment.model.User;
import com.example.SpringAndRestAssignment.service.UserService;


// UserController class
// This class defines REST endpoints for handling user-related operations such as searching, submitting, and deleting
@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService service;

    public UserController(UserService service) {
        this.service = service;
    }

    // SEARCH
    @GetMapping("/search")
    public ResponseEntity<List<User>> searchUsers(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Integer age,
            @RequestParam(required = false) String role) {

        List<User> users = service.searchUsers(name, age, role);

        return ResponseEntity.ok(users);
    }

    // SUBMIT
    @PostMapping("/submit")
    public ResponseEntity<String> submitUser(
            @RequestBody UserRequest request) {

        service.submitUser(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body("User created successfully");
    }

    // DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(
            @PathVariable Long id,
            @RequestParam(required = false) Boolean confirm) {

        String message = service.deleteUser(id, confirm);

        return ResponseEntity.ok(message);
    }
}