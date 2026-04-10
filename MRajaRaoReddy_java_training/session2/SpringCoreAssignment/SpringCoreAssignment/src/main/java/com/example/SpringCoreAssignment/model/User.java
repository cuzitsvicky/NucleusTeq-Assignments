package com.example.SpringCoreAssignment.model;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class User {

    // fields for User class
    private int id;

    // validation annotations for name field
    @NotBlank(message = "Name is required")
    private String name;

    // validation annotations for email field
    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;

    // constructor to initialize User object
    public User(int id, String name, String email) {
        this.id = id;
        this.name = name;
        this.email = email;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public int getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

}
