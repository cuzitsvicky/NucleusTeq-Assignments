package com.example.SpringCoreAssignment.service;

import org.springframework.stereotype.Service;

import com.example.SpringCoreAssignment.component.NotificationComponent;

@Service
public class NotificationService {

    private final NotificationComponent notificationComponent;

    public NotificationService(NotificationComponent notificationComponent) {
        this.notificationComponent = notificationComponent;
    }

    public String triggerNotification() {
        return notificationComponent.sendNotification();
    }
}