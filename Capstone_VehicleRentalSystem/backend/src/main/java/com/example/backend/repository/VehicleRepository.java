package com.example.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.backend.model.Vehicle.VehicleType;

import com.example.backend.model.Vehicle;

import java.util.List;

public interface VehicleRepository extends JpaRepository<Vehicle, Long> {

    /* Finds vehicles that are currently marked as available.  */
    List<Vehicle> findByAvailabilityStatusTrue();

    /* Finds vehicles by their type (e.g., CAR, BIKE). 
     * This method is used to filter the vehicle inventory based on the specified type, allowing users to browse vehicles of a particular category.
     */
    List<Vehicle> findByType(VehicleType type);
}