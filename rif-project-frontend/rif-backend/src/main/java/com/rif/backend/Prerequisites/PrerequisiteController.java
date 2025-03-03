package com.rif.backend.Prerequisites;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Optional;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/prerequisites")
public class PrerequisiteController {

    private final PrerequisiteService service;

    @Autowired
    public PrerequisiteController(PrerequisiteService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<?> createOrUpdatePrerequisite(@RequestBody Prerequisite prerequisite, Principal principal) {
        String email = principal.getName();
        try {
            Prerequisite savedPrerequisite = service.createOrUpdatePrerequisite(prerequisite, email);
            return ResponseEntity.ok(savedPrerequisite);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<Prerequisite> getPrerequisite(Principal principal) {
        Optional<Prerequisite> prerequisite = service.getPrerequisiteByUserEmail(principal.getName());
        if (prerequisite.isPresent()) {
            return ResponseEntity.ok(prerequisite.get());
        } else {
            Prerequisite emptyPrerequisite = new Prerequisite();
            emptyPrerequisite.setInternalStakeholders(new ArrayList<>());
            emptyPrerequisite.setExternalStakeholders(new ArrayList<>());
            return ResponseEntity.ok(emptyPrerequisite);
        }
    }

    @GetMapping("/unitTypeCount/{unitType}")
    public ResponseEntity<Long> getUnitCountByUnitType(@PathVariable String unitType) {
        long count = service.getUnitCountByUnitType(unitType);
        return ResponseEntity.ok(count);
    }

    @GetMapping("/byUserId/{userId}")
    public ResponseEntity<Prerequisite> getPrerequisiteByUserId(@PathVariable Long userId) {
        Optional<Prerequisite> prerequisite = service.getPrerequisiteByUserId(userId);
        return prerequisite.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.ok(new Prerequisite("Not Available", "", null)));
    }

    @GetMapping("/all")
    public ResponseEntity<List<Prerequisite>> getAllPrerequisites() {
        List<Prerequisite> prerequisites = service.getAllPrerequisites();
        return ResponseEntity.ok(prerequisites);
    }

    @GetMapping("/units")
    public ResponseEntity<List<String>> getAllUnits() {
        List<String> units = service.getAllUnits();
        return ResponseEntity.ok(units);
    }

    @GetMapping("/exists")
    public ResponseEntity<Boolean> checkUnitExists(@RequestParam String unit) {
        boolean exists = service.unitExists(unit);
        return ResponseEntity.ok(exists);
    }

    @GetMapping("/status")
    public ResponseEntity<Boolean> isPrerequisiteComplete(Principal principal) {
        boolean isComplete = service.isPrerequisiteComplete(principal.getName());
        return ResponseEntity.ok(isComplete);
    }
}
