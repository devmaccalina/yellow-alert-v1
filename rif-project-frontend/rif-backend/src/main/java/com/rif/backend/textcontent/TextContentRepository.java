package com.rif.backend.textcontent;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TextContentRepository extends JpaRepository<TextContent, Long> {
    Optional<TextContent> findByComponent(String component);
}
