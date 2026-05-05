package com.example.backend.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.backend.model.Booking;
import com.example.backend.model.User;
import com.example.backend.model.Vehicle;
import java.time.LocalDateTime;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {


    /* Finds bookings for a specific user. */
    List<Booking> findByUser(User user);

    /* Finds bookings for a specific vehicle. */
    List<Booking> findByVehicle(Vehicle vehicle);

    /* Finds bookings for a specific vehicle that have a status in the provided list of statuses and overlap with the specified date range. */
    List<Booking> findByVehicleAndStatusInAndStartDateLessThanAndEndDateGreaterThan(
            Vehicle vehicle, List<Booking.Status> statuses, LocalDateTime endDate, LocalDateTime startDate);
}