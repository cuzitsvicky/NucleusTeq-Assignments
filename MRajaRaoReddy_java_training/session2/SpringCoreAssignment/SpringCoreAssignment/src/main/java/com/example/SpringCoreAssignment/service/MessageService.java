package com.example.SpringCoreAssignment.service;

import org.springframework.stereotype.Service;

import com.example.SpringCoreAssignment.component.LongMessageFormatter;
import com.example.SpringCoreAssignment.component.ShortMessageFormatter;

@Service
public class MessageService {

    private final ShortMessageFormatter shortFormatter;
    private final LongMessageFormatter longFormatter;

    // constructor-based dependency injection for both formatters
    public MessageService(ShortMessageFormatter shortFormatter,
                          LongMessageFormatter longFormatter) {
        this.shortFormatter = shortFormatter;
        this.longFormatter = longFormatter;
    }

    // method to get formatted message based on type (SHORT or LONG)
    public String getMessage(String type) {

        if ("SHORT".equalsIgnoreCase(type)) {
            return shortFormatter.format();
        }

        return longFormatter.format();
    }
}