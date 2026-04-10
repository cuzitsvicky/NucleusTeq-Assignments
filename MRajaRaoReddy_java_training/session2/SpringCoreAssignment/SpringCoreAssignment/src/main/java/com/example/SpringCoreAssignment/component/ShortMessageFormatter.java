package com.example.SpringCoreAssignment.component;

import org.springframework.stereotype.Component;

@Component
public class ShortMessageFormatter implements MessageFormatter {

    // implementation of format method to return a short message
    public String format() {
        return "Short Message";
    }
}