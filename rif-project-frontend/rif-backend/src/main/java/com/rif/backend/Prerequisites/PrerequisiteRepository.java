package com.rif.backend.Prerequisites;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface PrerequisiteRepository extends JpaRepository<Prerequisite, Long> {
    Optional<Prerequisite> findByUserEmail(String email);

    @Query("SELECT COUNT(p) FROM Prerequisite p WHERE p.unitType = :unitType")
    long countByUnitType(String unitType);

    Optional<Prerequisite> findByUserId(Long userId);

    List<Prerequisite> findAll();

    boolean existsByUnit(String unit);
}
