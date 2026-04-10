package com.example.SpringCoreAssignment.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.SpringCoreAssignment.service.MessageService;

@RestController
public class MessageController {

    private final MessageService messageService;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    // get message based on type (SHORT or LONG)
    @GetMapping("/message")
    public String getMessage(@RequestParam String type) {
        return messageService.getMessage(type);
    }
}