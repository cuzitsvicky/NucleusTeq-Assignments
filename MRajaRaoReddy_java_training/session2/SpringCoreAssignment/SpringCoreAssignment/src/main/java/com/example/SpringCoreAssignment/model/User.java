package com.example.SpringCoreAssignment.model;

public class User {

    // fields for User class
    private int id;
    private String name;
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
