package com.example.SpringAdvanceAssignment.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.SpringAdvanceAssignment.entity.Todo;

public interface TodoRepository extends JpaRepository<Todo, Long> {
}
