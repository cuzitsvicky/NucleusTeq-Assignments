package com.example.backend.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.example.backend.dto.request.BookingRequestDto;
import com.example.backend.dto.response.BookingResponseDto;
import com.example.backend.exception.BadRequestException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.service.BookingService;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

@ExtendWith(MockitoExtension.class)
class BookingControllerTest {

    @Mock
    private BookingService bookingService;

    @Mock
    private Authentication authentication;

    private BookingController bookingController;

    @BeforeEach
    void setUp() {
        bookingController = new BookingController(bookingService);
    }

    @Test
    void bookVehicle_returnsServiceResponse() {
        BookingRequestDto request = bookingRequest();
        BookingResponseDto serviceResponse = booking(1L);

        when(authentication.getName()).thenReturn("user@example.com");
        when(bookingService.bookVehicle("user@example.com", request)).thenReturn(serviceResponse);

        ResponseEntity<BookingResponseDto> response = bookingController.bookVehicle(request, authentication);

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody()).isSameAs(serviceResponse);
        verify(bookingService).bookVehicle("user@example.com", request);
    }

    @Test
    void bookVehicle_propagatesServiceException() {
        BookingRequestDto request = bookingRequest();
        when(authentication.getName()).thenReturn("user@example.com");
        when(bookingService.bookVehicle("user@example.com", request))
                .thenThrow(new BadRequestException("Vehicle is not available"));

        assertThatThrownBy(() -> bookingController.bookVehicle(request, authentication))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("Vehicle is not available");
    }

    @Test
    void getMyBookings_returnsServiceList() {
        List<BookingResponseDto> bookings = List.of(booking(1L));
        when(authentication.getName()).thenReturn("user@example.com");
        when(bookingService.getMyBookings("user@example.com")).thenReturn(bookings);

        ResponseEntity<List<BookingResponseDto>> response = bookingController.getMyBookings(authentication);

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody()).isSameAs(bookings);
        verify(bookingService).getMyBookings("user@example.com");
    }

    @Test
    void getVehicleBookings_returnsServiceList() {
        List<BookingResponseDto> bookings = List.of(booking(1L));
        when(bookingService.getVehicleBookings(10L)).thenReturn(bookings);

        ResponseEntity<List<BookingResponseDto>> response = bookingController.getVehicleBookings(10L);

        assertThat(response.getBody()).isSameAs(bookings);
        verify(bookingService).getVehicleBookings(10L);
    }

    @Test
    void getVehicleBookings_propagatesServiceException() {
        when(bookingService.getVehicleBookings(404L))
                .thenThrow(new ResourceNotFoundException("Vehicle not found"));

        assertThatThrownBy(() -> bookingController.getVehicleBookings(404L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Vehicle not found");
    }

    @Test
    void getAllBookings_returnsServiceList() {
        List<BookingResponseDto> bookings = List.of(booking(1L), booking(2L));
        when(bookingService.getAllBookings()).thenReturn(bookings);

        ResponseEntity<List<BookingResponseDto>> response = bookingController.getAllBookings();

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody()).isSameAs(bookings);
        verify(bookingService).getAllBookings();
    }

    @Test
    void cancelBooking_returnsSuccessMessage() {
        when(authentication.getName()).thenReturn("user@example.com");

        ResponseEntity<String> response = bookingController.cancelBooking(5L, authentication);

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody()).isEqualTo("Booking cancelled successfully");
        verify(bookingService).cancelBooking("user@example.com", 5L);
    }

    @Test
    void cancelBooking_propagatesServiceException() {
        when(authentication.getName()).thenReturn("user@example.com");
        doThrow(new BadRequestException("Booking is already cancelled"))
                .when(bookingService).cancelBooking("user@example.com", 5L);

        assertThatThrownBy(() -> bookingController.cancelBooking(5L, authentication))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("Booking is already cancelled");
    }

    private static BookingRequestDto bookingRequest() {
        BookingRequestDto request = new BookingRequestDto();
        request.setVehicleId(10L);
        request.setStartDate(LocalDateTime.now().plusDays(1).toString());
        request.setEndDate(LocalDateTime.now().plusDays(3).toString());
        return request;
    }

    private static BookingResponseDto booking(Long id) {
        return new BookingResponseDto(
                id, 1L, "john", 10L, "Honda City", "Car",
                LocalDateTime.now().plusDays(1),
                LocalDateTime.now().plusDays(3),
                "CONFIRMED",
                LocalDateTime.now());
    }
}
