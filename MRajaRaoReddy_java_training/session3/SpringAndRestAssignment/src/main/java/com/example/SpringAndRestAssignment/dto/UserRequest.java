package com.example.SpringAndRestAssignment.dto;

// UserRequest DTO class
// This class is used to receive user data from the client when creating or updating a user
public class UserRequest {

    private String name;
    private Integer age;
    private String role;

    public String getName() { return name; }
    public Integer getAge() { return age; }
    public String getRole() { return role; }
    
}
