package com.rif.backend.MainUnit;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MainUnitService {
    private final MainUnitRepository mainUnitRepository;

    @Autowired
    public MainUnitService(MainUnitRepository mainUnitRepository) {
        this.mainUnitRepository = mainUnitRepository;
    }

    public List<MainUnit> getAllMainUnits() {
        return mainUnitRepository.findAll();
    }

    public Optional<MainUnit> getMainUnitById(Long id) {
        return mainUnitRepository.findById(id);
    }

    public MainUnit addMainUnit(MainUnit mainUnit) {
        return mainUnitRepository.save(mainUnit);
    }

    public MainUnit updateMainUnit(Long id, MainUnit mainUnit) {
        return mainUnitRepository.findById(id).map(existingUnit -> {
            existingUnit.setMainUnit(mainUnit.getMainUnit());
            existingUnit.setMainUnitType(mainUnit.getMainUnitType());
            return mainUnitRepository.save(existingUnit);
        }).orElseGet(() -> {
            mainUnit.setId(id);
            return mainUnitRepository.save(mainUnit);
        });
    }

    public void deleteMainUnit(Long id) {
        mainUnitRepository.deleteById(id);
    }
}
