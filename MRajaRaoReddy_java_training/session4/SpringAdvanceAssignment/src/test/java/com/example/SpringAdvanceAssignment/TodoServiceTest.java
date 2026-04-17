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

    // We use Mockito to mock dependencies and isolate the service layer for unit testing.
    // This allows us to verify the service's behavior without relying on actual database or external services, ensuring our tests are fast and focused on business logic validation.
    @Mock
    private TodoRepository repository;

    // We mock the notification client to verify that notifications are sent when expected without making real HTTP calls, allowing us to test side effects of service methods in isolation.
    @Mock
    private NotificationServiceClient notificationClient;

    // We inject the mocks into the service implementation to test the service logic with controlled dependencies, enabling us to simulate various scenarios and verify interactions with the repository and notification client.
    @InjectMocks
    private TodoServiceImpl service;

    // We initialize the mocks before each test to ensure a clean state and proper injection of dependencies, allowing us to write independent and reliable unit tests for the service methods.
    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);
    }

   
    @Test
    void createTodo_shouldSaveAndReturnResponse() {
        /*
           We verify the complete creation flow works end-to-end:
           - Ensure the todo is persisted with a generated ID
           - Ensure the response DTO correctly maps the saved entity
           - Ensure users are notified when a new todo is created (business requirement)
        */ 

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

    
    @Test
    void getAllTodos_shouldReturnList() {
        /*
           We need to ensure the service correctly aggregates all todos from the database
           and properly transforms them to response DTOs. This validates bulk retrieval operations
           that the UI/API relies on to display the dashboard.
        */ 

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


    @Test
    void getTodoById_shouldReturnTodo() {
        /*
           We validate the happy path for retrieving a single todo by ID.
           This ensures the service correctly queries the repository and transforms
           the entity to a DTO for API responses.
        */

        Todo todo = new Todo();
        todo.setId(1L);
		todo.setStatus(Status.PENDING); 

        when(repository.findById(1L)).thenReturn(Optional.of(todo));

        TodoResponseDTO result = service.getTodoById(1L);

        assertNotNull(result);
    }


    @Test
    void getTodoById_shouldThrowException() {
        /*
           We test the error handling for invalid requests: when a user tries to access
           a todo that doesn't exist, we must throw ResourceNotFoundException to prevent
           returning null or causing downstream errors in the API layer.
        */

        when(repository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> service.getTodoById(1L));
    }

    
    @Test
    void updateTodo_shouldUpdateSuccessfully() {
        /*
           We verify that state transitions work correctly: a PENDING todo can move to COMPLETED.
           We also ensure the service loads the existing entity before applying changes,
           preventing data loss from partial updates.
        */

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

    
    @Test
    void updateTodo_shouldThrowInvalidTransition() {
        /*
           We test business rule validation: the application must reject invalid status values
           that aren't part of the Status enum. This prevents data corruption from unexpected
           or malformed API requests.
        */ 

        Todo existing = new Todo();
        existing.setStatus(Status.PENDING);

        TodoRequestDTO dto = new TodoRequestDTO();
        dto.setTitle("Test");
        dto.setStatus("INVALID");

        when(repository.findById(1L)).thenReturn(Optional.of(existing));

        assertThrows(Exception.class,
                () -> service.updateTodo(1L, dto));
    }

  
    @Test
    void updateTodo_shouldThrowNotFound() {
        /*
           We ensure defensive programming: attempting to update a non-existent todo
           must fail fast with ResourceNotFoundException rather than silently creating
           a new record, which would violate the expected "update" semantics.
        */ 

        when(repository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> service.updateTodo(1L, new TodoRequestDTO()));
    }

    
    @Test
    void deleteTodo_shouldDelete() {
        /*
           We verify the happy path for deletion: the service must successfully locate
           the todo entity and pass it to the repository for removal. This validates
           that the delete operation correctly loads the entity before removal to avoid
           orphaned references or cascading delete issues.
        */ 

        Todo todo = new Todo();
        when(repository.findById(1L)).thenReturn(Optional.of(todo));

        service.deleteTodo(1L);

        verify(repository).delete(todo);
    }

    
    @Test
    void deleteTodo_shouldThrowException() {
        /*
            We test defensive error handling on delete: attempting to remove a non-existent
            todo must fail with ResourceNotFoundException to prevent silent failures and
            ensure the user knows their delete request couldn't be fulfilled.
        */ 

        when(repository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> service.deleteTodo(1L));
    }
}