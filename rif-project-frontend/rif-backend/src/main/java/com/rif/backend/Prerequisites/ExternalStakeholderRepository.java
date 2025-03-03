package com.rif.backend.Prerequisites;

import com.rif.backend.Prerequisites.InternalStakeholder;


import org.springframework.data.jpa.repository.JpaRepository;

public interface ExternalStakeholderRepository extends JpaRepository<ExternalStakeholder, Long> {
    // Custom query methods can be added here as well.
}