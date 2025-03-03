package com.rif.backend.Prerequisites;


import javax.persistence.*;
import com.fasterxml.jackson.annotation.JsonBackReference;

@Entity
public class InternalStakeholder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prerequisite_id")
    @JsonBackReference
    private Prerequisite prerequisite;

    // Constructors, getters, and setters
    public InternalStakeholder() {}

    public InternalStakeholder(String name, Prerequisite prerequisite) {
        this.name = name;
        this.prerequisite = prerequisite;
    }

    // Getters and setters
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
