package com.example.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.backend.model.Vehicle.VehicleType;

import com.example.backend.model.Vehicle;

import java.util.List;

public interface VehicleRepository extends JpaRepository<Vehicle, Long> {

    List<Vehicle> findByAvailabilityStatusTrue();

    List<Vehicle> findByType(VehicleType type);
}