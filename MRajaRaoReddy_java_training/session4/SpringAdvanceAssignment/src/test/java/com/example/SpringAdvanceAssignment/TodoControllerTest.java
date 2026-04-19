package com.example.SpringAdvanceAssignment;


import com.example.SpringAdvanceAssignment.controller.TodoController;
import com.example.SpringAdvanceAssignment.dto.TodoRequestDTO;
import com.example.SpringAdvanceAssignment.dto.TodoResponseDTO;
import com.example.SpringAdvanceAssignment.exception.GlobalExceptionHandler;
import com.example.SpringAdvanceAssignment.exception.InvalidStatusTransitionException;
import com.example.SpringAdvanceAssignment.exception.ResourceNotFoundException;
import com.example.SpringAdvanceAssignment.service.TodoService;
import tools.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import java.time.LocalDateTime;
import java.util.List;
import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/*
 * @WebMvcTest slices the Spring context to only load the web layer (controllers,
 * filters, advice). The service is mocked so tests remain fast and isolated from
 * business logic / persistence concerns.
 */
@WebMvcTest(TodoController.class)
@Import(GlobalExceptionHandler.class)
class TodoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    // Provide a mock of the service; Spring injects it into the controller automatically.
    @MockitoBean
    private TodoService todoService;

    @Autowired
    private ObjectMapper objectMapper;


    private TodoResponseDTO sampleResponse;
    private TodoRequestDTO validRequest;

    @BeforeEach
    void setUp() {
        // A valid request body used by most happy-path tests
        validRequest = new TodoRequestDTO();
        validRequest.setTitle("Buy groceries");
        validRequest.setDescription("Milk, eggs, and bread");
        validRequest.setStatus("PENDING");

        // A response DTO returned by the mocked service
        sampleResponse = new TodoResponseDTO();
        sampleResponse.setId(1L);
        sampleResponse.setTitle("Buy groceries");
        sampleResponse.setDescription("Milk, eggs, and bread");
        sampleResponse.setStatus("PENDING");
        sampleResponse.setCreatedAt(LocalDateTime.of(2025, 4, 18, 10, 30));
    }


    @Test
    void createTodo_validRequest_returns201AndBody() throws Exception {
        /*
         * Happy path: a well-formed request must result in 201 Created and the
         * response body must reflect the data returned by the service.
         */
        when(todoService.createTodo(any(TodoRequestDTO.class))).thenReturn(sampleResponse);

        mockMvc.perform(post("/todos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.title").value("Buy groceries"))
                .andExpect(jsonPath("$.description").value("Milk, eggs, and bread"))
                .andExpect(jsonPath("$.status").value("PENDING"));

        verify(todoService, times(1)).createTodo(any(TodoRequestDTO.class));
    }

    @Test
    void createTodo_nullTitle_returns400WithValidationError() throws Exception {
        /*
         * @NotNull on title must trigger Bean Validation and the GlobalExceptionHandler
         * must return a 400 with a field-level error map.
         */
        TodoRequestDTO badRequest = new TodoRequestDTO();
        badRequest.setTitle(null);                  // violates @NotNull
        badRequest.setDescription("Some description");
        badRequest.setStatus("PENDING");

        mockMvc.perform(post("/todos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(badRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.errors.title").exists());

        verify(todoService, never()).createTodo(any());
    }

    @Test
    void createTodo_shortTitle_returns400WithValidationError() throws Exception {
        /*
         * @Size(min = 3) on title must trigger Bean Validation when title is only
         * 2 characters long.
         */
        TodoRequestDTO badRequest = new TodoRequestDTO();
        badRequest.setTitle("AB");                  // violates @Size(min = 3)
        badRequest.setDescription("Some description");
        badRequest.setStatus("PENDING");

        mockMvc.perform(post("/todos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(badRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.errors.title").value("Title must be at least 3 characters"));

        verify(todoService, never()).createTodo(any());
    }

    @Test
    void createTodo_nullDescription_returns400WithValidationError() throws Exception {
        /*
         * @NotNull on description must surface a field error for "description".
         */
        TodoRequestDTO badRequest = new TodoRequestDTO();
        badRequest.setTitle("Valid Title");
        badRequest.setDescription(null);            // violates @NotNull
        badRequest.setStatus("PENDING");

        mockMvc.perform(post("/todos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(badRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.description").exists());
    }

    @Test
    void createTodo_nullStatus_returns400WithValidationError() throws Exception {
        /*
         * @NotNull on status must surface a field error for "status".
         */
        TodoRequestDTO badRequest = new TodoRequestDTO();
        badRequest.setTitle("Valid Title");
        badRequest.setDescription("Some description");
        badRequest.setStatus(null);                 // violates @NotNull

        mockMvc.perform(post("/todos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(badRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.status").exists());
    }


    @Test
    void getAllTodos_returnsListAnd200() throws Exception {
        /*
         * When the service returns two DTOs the controller must forward all of them
         * in the response body with HTTP 200 OK.
         */
        TodoResponseDTO second = new TodoResponseDTO();
        second.setId(2L);
        second.setTitle("Read a book");
        second.setDescription("Fiction");
        second.setStatus("COMPLETED");
        second.setCreatedAt(LocalDateTime.now());

        when(todoService.getAllTodos()).thenReturn(List.of(sampleResponse, second));

        mockMvc.perform(get("/todos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].id").value(1L))
                .andExpect(jsonPath("$[1].id").value(2L));

        verify(todoService, times(1)).getAllTodos();
    }

    @Test
    void getAllTodos_emptyList_returns200WithEmptyArray() throws Exception {
        /*
         * An empty database must produce an empty JSON array (not null / 404).
         */
        when(todoService.getAllTodos()).thenReturn(List.of());

        mockMvc.perform(get("/todos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }


    @Test
    void getTodoById_existingId_returns200AndBody() throws Exception {
        /*
         * Happy path: an existing ID must return the matching todo with HTTP 200.
         */
        when(todoService.getTodoById(1L)).thenReturn(sampleResponse);

        mockMvc.perform(get("/todos/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.title").value("Buy groceries"))
                .andExpect(jsonPath("$.status").value("PENDING"));

        verify(todoService, times(1)).getTodoById(1L);
    }

    @Test
    void getTodoById_nonExistingId_returns404() throws Exception {
        /*
         * The service throws ResourceNotFoundException for an unknown ID.
         * GlobalExceptionHandler must convert it to HTTP 404 with the correct body.
         */
        when(todoService.getTodoById(99L))
                .thenThrow(new ResourceNotFoundException("Todo not found with id: 99"));

        mockMvc.perform(get("/todos/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.error").value("NOT_FOUND"))
                .andExpect(jsonPath("$.message").value("Todo not found with id: 99"));
    }


    @Test
    void updateTodo_validRequest_returns200AndUpdatedBody() throws Exception {
        /*
         * Happy path: a valid update (PENDING → COMPLETED) must return the updated
         * resource with HTTP 200 OK.
         */
        TodoRequestDTO updateRequest = new TodoRequestDTO();
        updateRequest.setTitle("Buy groceries");
        updateRequest.setDescription("Milk, eggs, and bread");
        updateRequest.setStatus("COMPLETED");

        TodoResponseDTO updatedResponse = new TodoResponseDTO();
        updatedResponse.setId(1L);
        updatedResponse.setTitle("Buy groceries");
        updatedResponse.setDescription("Milk, eggs, and bread");
        updatedResponse.setStatus("COMPLETED");
        updatedResponse.setCreatedAt(sampleResponse.getCreatedAt());

        when(todoService.updateTodo(eq(1L), any(TodoRequestDTO.class))).thenReturn(updatedResponse);

        mockMvc.perform(put("/todos/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.status").value("COMPLETED"));

        verify(todoService, times(1)).updateTodo(eq(1L), any(TodoRequestDTO.class));
    }

    @Test
    void updateTodo_nonExistingId_returns404() throws Exception {
        /*
         * Updating a todo that doesn't exist must result in HTTP 404 Not Found.
         */
        when(todoService.updateTodo(eq(99L), any(TodoRequestDTO.class)))
                .thenThrow(new ResourceNotFoundException("Todo not found with id: 99"));

        mockMvc.perform(put("/todos/99")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.error").value("NOT_FOUND"));
    }

    @Test
    void updateTodo_invalidStatusTransition_returns400() throws Exception {
        /*
         * An invalid status transition (e.g. PENDING → PENDING) must surface as
         * HTTP 400 Bad Request via GlobalExceptionHandler.
         */
        when(todoService.updateTodo(eq(1L), any(TodoRequestDTO.class)))
                .thenThrow(new InvalidStatusTransitionException("Invalid status transition"));

        mockMvc.perform(put("/todos/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value("Invalid status transition"));
    }

    @Test
    void updateTodo_invalidRequestBody_returns400() throws Exception {
        /*
         * Bean Validation must fire on PUT just as it does on POST: a null title
         * must produce a 400 with field-level errors.
         */
        TodoRequestDTO badUpdate = new TodoRequestDTO();
        badUpdate.setTitle(null);                   // violates @NotNull
        badUpdate.setDescription("desc");
        badUpdate.setStatus("COMPLETED");

        mockMvc.perform(put("/todos/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(badUpdate)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.errors.title").exists());

        verify(todoService, never()).updateTodo(any(), any());
    }

    @Test
    void deleteTodo_existingId_returns200WithMessage() throws Exception {
        /*
         * Happy path: deleting a known ID must return HTTP 200 and the success message
         * defined in the controller ("Todo deleted successfully").
         */
        doNothing().when(todoService).deleteTodo(1L);

        mockMvc.perform(delete("/todos/1"))
                .andExpect(status().isOk())
                .andExpect(content().string("Todo deleted successfully"));

        verify(todoService, times(1)).deleteTodo(1L);
    }

    @Test
    void deleteTodo_nonExistingId_returns404() throws Exception {
        /*
         * Deleting a todo that doesn't exist must throw ResourceNotFoundException,
         * which GlobalExceptionHandler converts to HTTP 404.
         */
        doThrow(new ResourceNotFoundException("Todo not found with id: 99"))
                .when(todoService).deleteTodo(99L);

        mockMvc.perform(delete("/todos/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.error").value("NOT_FOUND"))
                .andExpect(jsonPath("$.message").value("Todo not found with id: 99"));
    }
}