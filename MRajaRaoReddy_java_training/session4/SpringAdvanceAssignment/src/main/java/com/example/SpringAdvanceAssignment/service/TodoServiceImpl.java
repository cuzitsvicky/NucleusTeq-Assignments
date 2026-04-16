package com.example.SpringAdvanceAssignment.service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import com.example.SpringAdvanceAssignment.dto.TodoRequestDTO;
import com.example.SpringAdvanceAssignment.dto.TodoResponseDTO;
import com.example.SpringAdvanceAssignment.entity.Todo;
import com.example.SpringAdvanceAssignment.enums.Status;
import com.example.SpringAdvanceAssignment.exception.InvalidStatusTransitionException;
import com.example.SpringAdvanceAssignment.exception.ResourceNotFoundException;
import com.example.SpringAdvanceAssignment.repository.TodoRepository;
import lombok.extern.slf4j.Slf4j;


// This service implementation provides the business logic for managing Todo items, including creating, retrieving, updating, and deleting todos. 
// It also handles status transitions and maps between entity and DTO objects.
@Service
@Slf4j
public class TodoServiceImpl implements TodoService {

    private static final Logger logger = LoggerFactory.getLogger(TodoServiceImpl.class);

    private final TodoRepository repository;
    private final NotificationServiceClient notificationClient;

    public TodoServiceImpl(TodoRepository repository, NotificationServiceClient notificationClient) {
        this.repository = repository;
        this.notificationClient = notificationClient;
    }

    // The createTodo method creates a new Todo item based on the provided request DTO, sets default values, and saves it to the repository. 
    // It returns a response DTO representing the created Todo.
    @Override
    public TodoResponseDTO createTodo(TodoRequestDTO dto) {

        logger.info("Creating TODO: {}", dto.getTitle());

        Todo todo = new Todo();

        todo.setTitle(dto.getTitle());
        todo.setDescription(dto.getDescription());

        
        if (dto.getStatus() == null) {
            todo.setStatus(Status.PENDING);
        } else {
            todo.setStatus(Status.valueOf(dto.getStatus()));
        }

        todo.setCreatedAt(LocalDateTime.now());

        Todo saved = repository.save(todo);

        notificationClient.sendNotification("New TODO created: " + saved.getTitle());

        logger.info("TODO created with id: {}", saved.getId());

        return mapToResponse(saved);
    }

    // The getAllTodos method retrieves all Todo items from the repository, maps them to response DTOs, and returns the list of DTOs.\
    // It uses Java Streams to perform the mapping and collection of results.
    @Override
    public List<TodoResponseDTO> getAllTodos() {

        logger.info("START: Fetching all TODOs");

        List<Todo> todos = repository.findAll();

        logger.info("SUCCESS: Total TODOs fetched: {}", todos.size());

        return todos.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // The getTodoById method retrieves a specific Todo item by its ID. If the item is not found, it throws a ResourceNotFoundException. 
    // If found, it maps the entity to a response DTO and returns it.
    @Override
    public TodoResponseDTO getTodoById(Long id) {

        logger.info("START: Fetching TODO with id: {}", id);

        Todo todo = repository.findById(id)
                .orElseThrow(() -> {
                    logger.error("ERROR: TODO not found with id: {}", id);
                    return new ResourceNotFoundException("Todo not found with id: " + id);
                });

        logger.info("SUCCESS: TODO found with id: {}", id);

        return mapToResponse(todo);
    }

    // The updateTodo method updates an existing Todo item based on the provided ID and request DTO. It first retrieves the existing item, checks for valid status transitions, updates the fields, and saves the changes.
    // If the item is not found, it throws a ResourceNotFoundException. 
    // If the status transition is invalid, it throws an InvalidStatusTransitionException.
    @Override
    public TodoResponseDTO updateTodo(Long id, TodoRequestDTO dto) {

        logger.info("START: Updating TODO with id: {}", id);

        Todo todo = repository.findById(id)
                .orElseThrow(() -> {
                    logger.error("ERROR: Cannot update. TODO not found with id: {}", id);
                    return new ResourceNotFoundException("Todo not found with id: " + id);
                });

         logger.debug("Old values -> Title: {}, Status: {}", 
                todo.getTitle(), todo.getStatus());
                
                
        todo.setTitle(dto.getTitle());
        todo.setDescription(dto.getDescription());

        if (dto.getStatus() != null) {
            Status newStatus = Status.valueOf(dto.getStatus());

           
            if (!isValidTransition(todo.getStatus(), newStatus)) {
                logger.error("ERROR: Invalid status transition from {} to {}", 
                        todo.getStatus(), newStatus);
                throw new InvalidStatusTransitionException("Invalid status transition");
            }

            todo.setStatus(newStatus);
        }

        logger.info("SUCCESS: TODO updated with id: {}", id);

        return mapToResponse(repository.save(todo));
    }

    // The deleteTodo method deletes a Todo item by its ID. It first retrieves the item to ensure it exists, and if not found, it throws a ResourceNotFoundException.
    // If found, it deletes the item from the repository.
    @Override
    public void deleteTodo(Long id) {

        logger.info("START: Deleting TODO with id: {}", id);

       Todo todo = repository.findById(id)
                .orElseThrow(() -> {
                    logger.error("ERROR: Cannot delete. TODO not found with id: {}", id);
                    return new ResourceNotFoundException("Todo not found with id: " + id);
                });

        repository.delete(todo);

        logger.info("SUCCESS: TODO deleted with id: {}", id);
    }

   // The isValidTransition method checks if the transition from the old status to the new status is valid according to the defined rules.
   // It allows transitions between PENDING and COMPLETED, as well as keeping the same status. Any other transition is considered invalid.
    private boolean isValidTransition(Status oldStatus, Status newStatus) {

        logger.debug("Validating status transition: {} -> {}", oldStatus, newStatus);

        return (oldStatus == Status.PENDING && newStatus == Status.COMPLETED) ||
               (oldStatus == Status.COMPLETED && newStatus == Status.PENDING) ||
               (oldStatus == newStatus);
    }

   // The mapToResponse method is a helper method that converts a Todo entity to a TodoResponseDTO. 
   // It maps the fields from the entity to the DTO, including converting the status enum to its string representation.
    private TodoResponseDTO mapToResponse(Todo todo) {

        logger.debug("Mapping Todo entity to Response DTO for id: {}", todo.getId());
        TodoResponseDTO dto = new TodoResponseDTO();

        dto.setId(todo.getId());
        dto.setTitle(todo.getTitle());
        dto.setDescription(todo.getDescription());
        dto.setStatus(todo.getStatus().name());
        dto.setCreatedAt(todo.getCreatedAt());

        return dto;
    }
}