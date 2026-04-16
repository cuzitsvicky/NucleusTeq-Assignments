package com.example.SpringAdvanceAssignment;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import com.example.SpringAdvanceAssignment.dto.TodoRequestDTO;
import com.example.SpringAdvanceAssignment.dto.TodoResponseDTO;
import com.example.SpringAdvanceAssignment.entity.Todo;
import com.example.SpringAdvanceAssignment.enums.Status;
import com.example.SpringAdvanceAssignment.exception.ResourceNotFoundException;
import com.example.SpringAdvanceAssignment.repository.TodoRepository;
import com.example.SpringAdvanceAssignment.service.NotificationServiceClient;
import com.example.SpringAdvanceAssignment.service.TodoServiceImpl;
import java.util.*;



class TodoServiceTest {

    @Mock
    private TodoRepository repository;

    @Mock
    private NotificationServiceClient notificationClient;

    @InjectMocks
    private TodoServiceImpl service;

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);
    }

    // ✅ CREATE TODO
    @Test
    void createTodo_shouldSaveAndReturnResponse() {

        TodoRequestDTO dto = new TodoRequestDTO();
        dto.setTitle("Task");

        Todo saved = new Todo();
        saved.setId(1L);
        saved.setTitle("Task");
        saved.setStatus(Status.PENDING);

        when(repository.save(any())).thenReturn(saved);

        TodoResponseDTO result = service.createTodo(dto);

        assertEquals("Task", result.getTitle());
        verify(notificationClient).sendNotification(anyString());
    }

    // ✅ GET ALL
    @Test
    void getAllTodos_shouldReturnList() {

        Todo t1 = new Todo();
		t1.setId(1L);
		t1.setTitle("Task1");
		t1.setStatus(Status.PENDING); 

		Todo t2 = new Todo();
		t2.setId(2L);
		t2.setTitle("Task2");
		t2.setStatus(Status.COMPLETED); 

		when(repository.findAll()).thenReturn(List.of(t1, t2));

		List<TodoResponseDTO> list = service.getAllTodos();

		assertEquals(2, list.size());
    }

    // ✅ GET BY ID SUCCESS
    @Test
    void getTodoById_shouldReturnTodo() {

        Todo todo = new Todo();
        todo.setId(1L);
		todo.setStatus(Status.PENDING); 

        when(repository.findById(1L)).thenReturn(Optional.of(todo));

        TodoResponseDTO result = service.getTodoById(1L);

        assertNotNull(result);
    }

    // ❌ GET BY ID NOT FOUND
    @Test
    void getTodoById_shouldThrowException() {

        when(repository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> service.getTodoById(1L));
    }

    // ✅ UPDATE SUCCESS
    @Test
    void updateTodo_shouldUpdateSuccessfully() {

        Todo existing = new Todo();
        existing.setId(1L);
        existing.setStatus(Status.PENDING);

        TodoRequestDTO dto = new TodoRequestDTO();
        dto.setTitle("Updated");
        dto.setStatus("COMPLETED");

        when(repository.findById(1L)).thenReturn(Optional.of(existing));
        when(repository.save(any())).thenReturn(existing);

        TodoResponseDTO result = service.updateTodo(1L, dto);

        assertEquals("COMPLETED", result.getStatus());
    }

    // ❌ INVALID STATUS
    @Test
    void updateTodo_shouldThrowInvalidTransition() {

        Todo existing = new Todo();
        existing.setStatus(Status.PENDING);

        TodoRequestDTO dto = new TodoRequestDTO();
        dto.setTitle("Test");
        dto.setStatus("INVALID");

        when(repository.findById(1L)).thenReturn(Optional.of(existing));

        assertThrows(Exception.class,
                () -> service.updateTodo(1L, dto));
    }

    // ❌ UPDATE NOT FOUND
    @Test
    void updateTodo_shouldThrowNotFound() {

        when(repository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> service.updateTodo(1L, new TodoRequestDTO()));
    }

    // ✅ DELETE
    @Test
    void deleteTodo_shouldDelete() {

        Todo todo = new Todo();
        when(repository.findById(1L)).thenReturn(Optional.of(todo));

        service.deleteTodo(1L);

        verify(repository).delete(todo);
    }

    // ❌ DELETE NOT FOUND
    @Test
    void deleteTodo_shouldThrowException() {

        when(repository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> service.deleteTodo(1L));
    }
}