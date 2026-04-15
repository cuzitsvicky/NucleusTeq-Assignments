package com.example.SpringAdvanceAssignment.service;
import java.util.List;
import com.example.SpringAdvanceAssignment.dto.TodoRequestDTO;
import com.example.SpringAdvanceAssignment.dto.TodoResponseDTO;

// This interface defines the service layer for managing Todo items, providing methods for creating, retrieving, updating, and deleting todos.
public interface TodoService {

    // Method to create a new Todo item based on the provided request DTO and return a response DTO.
    TodoResponseDTO createTodo(TodoRequestDTO dto);

    // Method to retrieve all Todo items and return a list of response DTOs.
    List<TodoResponseDTO> getAllTodos();

    // Method to retrieve a specific Todo item by its ID and return a response DTO.
    TodoResponseDTO getTodoById(Long id);

    // Method to update an existing Todo item and return a response DTO.
    TodoResponseDTO updateTodo(Long id, TodoRequestDTO dto);

    // Method to delete a Todo item by its ID.
    void deleteTodo(Long id);
}
