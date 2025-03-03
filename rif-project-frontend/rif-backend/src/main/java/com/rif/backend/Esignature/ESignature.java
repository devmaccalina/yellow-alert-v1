package com.rif.backend.Esignature;

import com.rif.backend.Auth.User;

import javax.persistence.*;

@Entity
@Table(name = "eSignatures")
public class ESignature {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String professionalTitle;

    @Column
    private String postNominalTitle;

    @Lob
    @Column(name = "e_signature_photo", columnDefinition = "BLOB")
    private byte[] eSignaturePhoto;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Default constructor
    public ESignature() {
    }

    // Constructor with all fields
    public ESignature(String professionalTitle, String postNominalTitle, byte[] eSignaturePhoto, User user) {
        this.professionalTitle = professionalTitle;
        this.postNominalTitle = postNominalTitle;
        this.eSignaturePhoto = eSignaturePhoto;
        this.user = user;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getProfessionalTitle() {
        return professionalTitle;
    }

    public void setProfessionalTitle(String professionalTitle) {
        this.professionalTitle = professionalTitle;
    }

    public String getPostNominalTitle() {
        return postNominalTitle;
    }

    public void setPostNominalTitle(String postNominalTitle) {
        this.postNominalTitle = postNominalTitle;
    }

    public byte[] getESignaturePhoto() {
        return eSignaturePhoto;
    }

    public void setESignaturePhoto(byte[] eSignaturePhoto) {
        this.eSignaturePhoto = eSignaturePhoto;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }
}
