package com.example.SpringAdvanceAssignment.service;
import org.springframework.stereotype.Component;

@Component
public class NotificationServiceClient {

    public void sendNotification(String message) {
        System.out.println("Notification sent: " + message);
    }
}