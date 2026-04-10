package com.example.SpringCoreAssignment.repository;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Repository;

import com.example.SpringCoreAssignment.model.User;

@Repository
public class UserRepository {

    private final List<User> users = new ArrayList<>();

    //dummy data for testing
    public UserRepository() {

        users.add(new User(1, "M Raja Rao Reddy", "vicky@email.com"));
        users.add(new User(2, "Rahul", "rahul@email.com"));
        users.add(new User(3, "Priya", "priya@email.com"));

    }

    
    public List<User> findAll() {
        return users;
    }

    public User findById(int id) {
        return users.stream()
                .filter(user -> user.getId() == id)
                .findFirst()
                .orElse(null);
    }

    public void save(User user) {
        users.add(user);
    }

    public User update(int id, User user) {
        for (User user1 : users) {

            if (user1.getId() == id) {

                user1.setName(user.getName());
                user1.setEmail(user.getEmail());

                return user1;
            }
        }

        return null;
    }

    public boolean deleteUser(int id) {

        for (User user : users) {

            if (user.getId() == id) {
                users.remove(user);
                return true;
            }
        }

        return false;
    }
}
