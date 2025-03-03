package com.rif.backend.MainUnit;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/main-units")
public class MainUnitController {
    private final MainUnitService mainUnitService;

    @Autowired
    public MainUnitController(MainUnitService mainUnitService) {
        this.mainUnitService = mainUnitService;
    }

    @GetMapping
    public List<MainUnit> getAllMainUnits() {
        return mainUnitService.getAllMainUnits();
    }

    @GetMapping("/{id}")
    public Optional<MainUnit> getMainUnitById(@PathVariable Long id) {
        return mainUnitService.getMainUnitById(id);
    }

    @PostMapping
    public MainUnit addMainUnit(@RequestBody MainUnit mainUnit) {
        return mainUnitService.addMainUnit(mainUnit);
    }

    @PutMapping("/{id}")
    public MainUnit updateMainUnit(@PathVariable Long id, @RequestBody MainUnit mainUnit) {
        return mainUnitService.updateMainUnit(id, mainUnit);
    }

    @DeleteMapping("/{id}")
    public void deleteMainUnit(@PathVariable Long id) {
        mainUnitService.deleteMainUnit(id);
    }
}
