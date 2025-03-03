package com.rif.backend.MainUnit;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MainUnitRepository extends JpaRepository<MainUnit, Long> {
}
