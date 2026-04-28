package com.example.backend.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.backend.model.Booking;
import com.example.backend.model.User;
import com.example.backend.model.Vehicle;
import java.time.LocalDateTime;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {


    /* Finds bookings for a specific user. This method is used to retrieve all bookings made by a particular user, allowing them to view their booking history and manage their reservations.
     * It returns a list of Booking entities associated with the specified user.
     */
    List<Booking> findByUser(User user);

    /* Finds bookings for a specific vehicle. This method is used to retrieve all bookings made for a particular vehicle, allowing users to view its booking history and manage reservations.
     * It returns a list of Booking entities associated with the specified vehicle.
     */
    List<Booking> findByVehicle(Vehicle vehicle);

    /* Finds bookings for a specific vehicle that have a status in the provided list of statuses and overlap with the specified date range.
     * This method is used to check for conflicting bookings when creating a new booking for a vehicle, ensuring that the vehicle is available during the requested time period.
     * It returns a list of bookings that match the criteria, which can be used to determine if there are any scheduling conflicts.
     */
    List<Booking> findByVehicleAndStatusInAndStartDateLessThanAndEndDateGreaterThan(
            Vehicle vehicle, List<Booking.Status> statuses, LocalDateTime endDate, LocalDateTime startDate);
}