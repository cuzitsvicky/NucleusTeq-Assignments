package com.example.SpringCoreAssignment.component;

import org.springframework.stereotype.Component;

// Implementation of MessageFormatter for short messages
@Component
public class ShortMessageFormatter implements MessageFormatter {

    @Override
    public String formatMessage() {
        return "Short Message";
    }

    @Override
    public String getType() {
        return "SHORT";
    }
}