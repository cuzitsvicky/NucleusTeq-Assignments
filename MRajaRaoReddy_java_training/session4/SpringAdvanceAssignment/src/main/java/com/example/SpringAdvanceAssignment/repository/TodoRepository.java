package com.example.SpringAdvanceAssignment.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.SpringAdvanceAssignment.entity.Todo;

// This interface extends JpaRepository, providing CRUD operations for Todo entities
public interface TodoRepository extends JpaRepository<Todo, Long> {
}
