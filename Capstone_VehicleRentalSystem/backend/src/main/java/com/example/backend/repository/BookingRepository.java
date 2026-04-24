package com.example.backend.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.backend.model.Booking;
import com.example.backend.model.User;
import com.example.backend.model.Vehicle;
import java.time.LocalDateTime;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUser(User user);

    List<Booking> findByVehicle(Vehicle vehicle);

    List<Booking> findByVehicleAndStatusInAndStartDateLessThanAndEndDateGreaterThan(
            Vehicle vehicle, List<Booking.Status> statuses, LocalDateTime endDate, LocalDateTime startDate);
}