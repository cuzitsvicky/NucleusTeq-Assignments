package com.example.SpringCoreAssignment.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.SpringCoreAssignment.component.MessageFormatter;

// Service to manage messages using different formatters
@Service
public class MessageService {

    private final List<MessageFormatter> formatters;

    public MessageService(List<MessageFormatter> formatters) {
        this.formatters = formatters;
    }

    public String getMessage(String type) {

        for (MessageFormatter formatter : formatters) {

            if (formatter.getType().equalsIgnoreCase(type)) {
                return formatter.formatMessage();
            }
        }

        throw new RuntimeException("Invalid message type: " + type);
    }
}