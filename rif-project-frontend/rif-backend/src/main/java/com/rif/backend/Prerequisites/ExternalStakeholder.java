package com.rif.backend.Prerequisites;

import javax.persistence.*;
import com.fasterxml.jackson.annotation.JsonBackReference;

@Entity
public class ExternalStakeholder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prerequisite_id")
    @JsonBackReference
    private Prerequisite prerequisite;

    // Constructors, getters, and setters
    public ExternalStakeholder() {}

    public ExternalStakeholder(String name) {
        this.name = name;
    }
    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Prerequisite getPrerequisite() {
        return prerequisite;
    }

    public void setPrerequisite(Prerequisite prerequisite) {
        this.prerequisite = prerequisite;
    }
}
