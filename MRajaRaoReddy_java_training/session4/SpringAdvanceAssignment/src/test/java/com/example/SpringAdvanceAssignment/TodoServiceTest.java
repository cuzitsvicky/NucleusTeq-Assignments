package com.example.SpringAdvanceAssignment;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import com.example.SpringAdvanceAssignment.dto.TodoRequestDTO;
import com.example.SpringAdvanceAssignment.dto.TodoResponseDTO;
import com.example.SpringAdvanceAssignment.entity.Todo;
import com.example.SpringAdvanceAssignment.enums.Status;
import com.example.SpringAdvanceAssignment.exception.InvalidStatusTransitionException;
import com.example.SpringAdvanceAssignment.exception.ResourceNotFoundException;
import com.example.SpringAdvanceAssignment.repository.TodoRepository;
import com.example.SpringAdvanceAssignment.service.NotificationServiceClient;
import com.example.SpringAdvanceAssignment.service.TodoServiceImpl;
import java.time.LocalDateTime;
import java.util.*;

/*
 * Unit tests for TodoServiceImpl.
 *
 * We use @ExtendWith(MockitoExtension.class) instead of manually calling
 * MockitoAnnotations.openMocks(this) in @BeforeEach. The extension is the
 * modern, recommended approach — it handles mock lifecycle automatically and
 * produces cleaner failure messages when a mock is misconfigured.
 *
 * All dependencies (repository, notificationClient) are mocked so these tests
 * exercise only the service's business logic in complete isolation.
 */
@ExtendWith(MockitoExtension.class)
class TodoServiceTest {

    @Mock
    private TodoRepository repository;

    /*
     * We mock the notification client to verify that notifications are sent when
     * expected without making real calls, allowing us to test side-effects of
     * service methods in isolation.
     */
    @Mock
    private NotificationServiceClient notificationClient;

    /*
     * @InjectMocks creates a real TodoServiceImpl instance and injects the mocks
     * above via constructor injection — matching the constructor:
     * TodoServiceImpl(TodoRepository, NotificationServiceClient).
     */
    @InjectMocks
    private TodoServiceImpl service;

    // ─── Shared helper ───────────────────────────────────────────────────────

    /**
     * Builds a fully-populated Todo entity so individual tests don't have to
     * repeat boilerplate. Tests that need a different state can override fields.
     */
    private Todo buildTodo(Long id, String title, String description, Status status) {
        Todo todo = new Todo();
        todo.setId(id);
        todo.setTitle(title);
        todo.setDescription(description);
        todo.setStatus(status);
        todo.setCreatedAt(LocalDateTime.of(2025, 4, 18, 10, 30));
        return todo;
    }

    @Test
    void createTodo_shouldSaveAndReturnResponse() {
        /*
         * Happy path — verify the complete creation flow:
         *   1. The todo is persisted with a generated ID.
         *   2. The response DTO correctly maps the saved entity.
         *   3. The notification client is called (business requirement).
         */
        TodoRequestDTO dto = new TodoRequestDTO();
        dto.setTitle("Task");
        dto.setDescription("Do something");
        dto.setStatus("PENDING");

        Todo saved = buildTodo(1L, "Task", "Do something", Status.PENDING);

        when(repository.save(any(Todo.class))).thenReturn(saved);

        TodoResponseDTO result = service.createTodo(dto);

        assertNotNull(result);
        assertEquals(1L,       result.getId());
        assertEquals("Task",   result.getTitle());
        assertEquals("PENDING", result.getStatus());

        // Notification must be triggered exactly once on creation
        verify(notificationClient, times(1)).sendNotification(anyString());
        verify(repository, times(1)).save(any(Todo.class));
    }

    @Test
    void createTodo_nullStatusInDto_defaultsToPending() {
        /*
         * When the caller omits status (null), the service must default to PENDING
         * rather than throwing a NullPointerException or persisting a null value.
         */
        TodoRequestDTO dto = new TodoRequestDTO();
        dto.setTitle("Task without status");
        dto.setDescription("Description");
        dto.setStatus(null);   // deliberately omitted

        Todo saved = buildTodo(2L, "Task without status", "Description", Status.PENDING);

        when(repository.save(any(Todo.class))).thenReturn(saved);

        TodoResponseDTO result = service.createTodo(dto);

        assertEquals("PENDING", result.getStatus());
        verify(notificationClient, times(1)).sendNotification(anyString());
    }


    @Test
    void getAllTodos_shouldReturnList() {
        /*
         * Verify the service correctly aggregates all todos from the database and
         * properly transforms them to response DTOs — validates bulk retrieval
         * that the API relies on for the list endpoint.
         */
        Todo t1 = buildTodo(1L, "Task1", "Desc1", Status.PENDING);
        Todo t2 = buildTodo(2L, "Task2", "Desc2", Status.COMPLETED);

        when(repository.findAll()).thenReturn(List.of(t1, t2));

        List<TodoResponseDTO> result = service.getAllTodos();

        assertEquals(2, result.size());
        assertEquals("Task1",     result.get(0).getTitle());
        assertEquals("PENDING",   result.get(0).getStatus());
        assertEquals("Task2",     result.get(1).getTitle());
        assertEquals("COMPLETED", result.get(1).getStatus());
    }

    @Test
    void getAllTodos_emptyRepository_returnsEmptyList() {
        /*
         * An empty table must produce an empty list — not null and not an exception.
         * This guards against accidental NPE in the stream pipeline.
         */
        when(repository.findAll()).thenReturn(Collections.emptyList());

        List<TodoResponseDTO> result = service.getAllTodos();

        assertNotNull(result);
        assertTrue(result.isEmpty());
    }


    @Test
    void getTodoById_shouldReturnTodo() {
        /*
         * Happy path for single-item retrieval: the service must query the
         * repository by ID and map the entity to a response DTO correctly.
         */
        Todo todo = buildTodo(1L, "Task", "Desc", Status.PENDING);

        when(repository.findById(1L)).thenReturn(Optional.of(todo));

        TodoResponseDTO result = service.getTodoById(1L);

        assertNotNull(result);
        assertEquals(1L,       result.getId());
        assertEquals("Task",   result.getTitle());
        assertEquals("PENDING", result.getStatus());
    }

    @Test
    void getTodoById_shouldThrowException() {
        /*
         * When the requested ID doesn't exist the service must throw
         * ResourceNotFoundException — prevents returning null or causing
         * downstream NullPointerExceptions in the controller / response mapper.
         */
        when(repository.findById(99L)).thenReturn(Optional.empty());

        ResourceNotFoundException ex = assertThrows(
                ResourceNotFoundException.class,
                () -> service.getTodoById(99L)
        );

        assertTrue(ex.getMessage().contains("99"));
    }


    @Test
    void updateTodo_shouldUpdateSuccessfully() {
        /*
         * Verify PENDING → COMPLETED is a valid transition.
         *
         * FIX (bug in original test): the mock must return a Todo whose status is
         * already COMPLETED, because the service calls repository.save(todo) after
         * mutating the entity in-place and then maps the *return value* of save().
         * If the mock returns the same PENDING entity the assertion fails.
         */
        Todo existing = buildTodo(1L, "Task", "Desc", Status.PENDING);

        TodoRequestDTO dto = new TodoRequestDTO();
        dto.setTitle("Updated Task");
        dto.setDescription("Updated Desc");
        dto.setStatus("COMPLETED");

        // The entity that the repository returns after save must reflect the new status
        Todo afterSave = buildTodo(1L, "Updated Task", "Updated Desc", Status.COMPLETED);

        when(repository.findById(1L)).thenReturn(Optional.of(existing));
        when(repository.save(any(Todo.class))).thenReturn(afterSave);

        TodoResponseDTO result = service.updateTodo(1L, dto);

        assertEquals("COMPLETED",    result.getStatus());
        assertEquals("Updated Task", result.getTitle());
        verify(repository, times(1)).save(any(Todo.class));
    }

    @Test
    void updateTodo_completedToPending_shouldUpdateSuccessfully() {
        /*
         * COMPLETED → PENDING is also an allowed reverse transition.
         * Explicitly test it so the isValidTransition logic is fully covered.
         */
        Todo existing = buildTodo(1L, "Task", "Desc", Status.COMPLETED);

        TodoRequestDTO dto = new TodoRequestDTO();
        dto.setTitle("Task");
        dto.setDescription("Desc");
        dto.setStatus("PENDING");

        Todo afterSave = buildTodo(1L, "Task", "Desc", Status.PENDING);

        when(repository.findById(1L)).thenReturn(Optional.of(existing));
        when(repository.save(any(Todo.class))).thenReturn(afterSave);

        TodoResponseDTO result = service.updateTodo(1L, dto);

        assertEquals("PENDING", result.getStatus());
    }

    @Test
    void updateTodo_pendingToPending_shouldThrowInvalidTransition() {
        /*
         * PENDING → PENDING is not allowed (same-status transition).
         * The service must throw InvalidStatusTransitionException.
         */
        Todo existing = buildTodo(1L, "Task", "Desc", Status.PENDING);

        TodoRequestDTO dto = new TodoRequestDTO();
        dto.setTitle("Task");
        dto.setDescription("Desc");
        dto.setStatus("PENDING");   // same as current — invalid

        when(repository.findById(1L)).thenReturn(Optional.of(existing));

        assertThrows(
                InvalidStatusTransitionException.class,
                () -> service.updateTodo(1L, dto)
        );

        verify(repository, never()).save(any());
    }

    @Test
    void updateTodo_shouldThrowInvalidTransition() {
        /*
         * FIX (bug in original test): Status.valueOf("INVALID") throws
         * IllegalArgumentException — not InvalidStatusTransitionException.
         * The correct expected exception type here is IllegalArgumentException.
         *
         * This tests that garbage status strings are rejected before the
         * transition check even runs, preventing data corruption.
         */
        Todo existing = buildTodo(1L, "Task", "Desc", Status.PENDING);

        TodoRequestDTO dto = new TodoRequestDTO();
        dto.setTitle("Test");
        dto.setDescription("Desc");
        dto.setStatus("INVALID");   // not a valid Status enum value

        when(repository.findById(1L)).thenReturn(Optional.of(existing));

        assertThrows(
                IllegalArgumentException.class,
                () -> service.updateTodo(1L, dto)
        );

        verify(repository, never()).save(any());
    }

    @Test
    void updateTodo_shouldThrowNotFound() {
        /*
         * Attempting to update a non-existent todo must throw
         * ResourceNotFoundException — fail-fast prevents accidentally creating
         * a new record when "update" semantics are expected.
         */
        when(repository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> service.updateTodo(1L, new TodoRequestDTO())
        );

        verify(repository, never()).save(any());
    }


    @Test
    void deleteTodo_shouldDelete() {
        /*
         * Happy path: the service must load the entity first and then pass it
         * to repository.delete() — not just call deleteById() blindly. This
         * validates that the service follows the load-then-delete pattern to
         * avoid orphaned references.
         */
        Todo todo = buildTodo(1L, "Task", "Desc", Status.PENDING);

        when(repository.findById(1L)).thenReturn(Optional.of(todo));

        service.deleteTodo(1L);

        verify(repository, times(1)).delete(todo);
    }

    @Test
    void deleteTodo_shouldThrowException() {
        /*
         * Deleting a non-existent todo must throw ResourceNotFoundException
         * so the caller knows the delete couldn't be fulfilled — prevents
         * silent no-ops that leave the client with stale data.
         */
        when(repository.findById(99L)).thenReturn(Optional.empty());

        ResourceNotFoundException ex = assertThrows(
                ResourceNotFoundException.class,
                () -> service.deleteTodo(99L)
        );

        assertTrue(ex.getMessage().contains("99"));
        verify(repository, never()).delete(any());
    }
}