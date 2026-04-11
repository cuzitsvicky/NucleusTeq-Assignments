package com.example.SpringCoreAssignment.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.SpringCoreAssignment.component.MessageFormatter;

// Service to manage messages using different formatters
@Service
public class MessageService {

    // List of all MessageFormatter implementations injected by Spring
    private final List<MessageFormatter> formatters;

    // constructor-based dependency injection for all MessageFormatter implementations
    public MessageService(List<MessageFormatter> formatters) {
        this.formatters = formatters;
    }

    public String getMessage(String type) {

        // find the appropriate formatter based on type and return the formatted message
        for (MessageFormatter formatter : formatters) {

            if (formatter.getType().equalsIgnoreCase(type)) {
                return formatter.formatMessage();
            }
        }

        // if no formatter found for the given type, throw an exception
        throw new RuntimeException("Invalid message type: " + type);
    }
}