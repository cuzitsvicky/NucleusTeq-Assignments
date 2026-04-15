package com.example.SpringAdvanceAssignment.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.SpringAdvanceAssignment.dto.TodoRequestDTO;
import com.example.SpringAdvanceAssignment.dto.TodoResponseDTO;
import com.example.SpringAdvanceAssignment.service.TodoService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/todos")
public class TodoController {

    private final TodoService service;

    // Inject via constructor for immutability and simplified testing
    public TodoController(TodoService service) {
        this.service = service;
    }

    
    // Return 201 to indicate successful resource creation with new location
    @PostMapping
    public ResponseEntity<TodoResponseDTO> createTodo(@Valid @RequestBody TodoRequestDTO dto) {
        TodoResponseDTO response = service.createTodo(dto);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    
    // Retrieve all records without modification
    @GetMapping
    public ResponseEntity<List<TodoResponseDTO>> getAllTodos() {
        List<TodoResponseDTO> todos = service.getAllTodos();
        return ResponseEntity.ok(todos);
    }

    
    // Single record retrieval; service throws exception if not found
    @GetMapping("/{id}")
    public ResponseEntity<TodoResponseDTO> getTodoById(@PathVariable Long id) {
        TodoResponseDTO todo = service.getTodoById(id);
        return ResponseEntity.ok(todo);
    }

    
    // Full resource replacement; validate both id existence and request payload
    @PutMapping("/{id}")
    public ResponseEntity<TodoResponseDTO> updateTodo(
            @PathVariable Long id,
            @Valid @RequestBody TodoRequestDTO dto) {

        TodoResponseDTO updated = service.updateTodo(id, dto);
        return ResponseEntity.ok(updated);
    }

    
    // Return 204 to indicate successful deletion with no response body needed
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTodo(@PathVariable Long id) {
        service.deleteTodo(id);
        return ResponseEntity.noContent().build();
    }
}