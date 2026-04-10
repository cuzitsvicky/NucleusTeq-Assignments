package com.example.SpringCoreAssignment.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.SpringCoreAssignment.service.NotificationService;

@RestController
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    // Trigger notification
    @GetMapping("/notify")
    public String notifyUser() {
        return notificationService.triggerNotification();
    }
}