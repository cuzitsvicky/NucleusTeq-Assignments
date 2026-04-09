package com.example.SpringCoreAssignment.component;

import org.springframework.stereotype.Component;

@Component
public class NotificationComponent {

    public String sendNotification() {
        return "Notification Sent";
    }
}