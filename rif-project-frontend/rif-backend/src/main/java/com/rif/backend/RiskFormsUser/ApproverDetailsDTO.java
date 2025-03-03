package com.rif.backend.RiskFormsUser;

public class ApproverDetailsDTO {
    private String professionalTitle;
    private String postNominalTitle;
    private byte[] approverPhoto;
    private String userFirstname;
    private String userLastname;

    public ApproverDetailsDTO(String professionalTitle, String postNominalTitle, byte[] approverPhoto, String userFirstname, String userLastname) {
        this.professionalTitle = professionalTitle;
        this.postNominalTitle = postNominalTitle;
        this.approverPhoto = approverPhoto;
        this.userFirstname = userFirstname;
        this.userLastname = userLastname;
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

    public byte[] getApproverPhoto() {
        return approverPhoto;
    }

    public void setApproverPhoto(byte[] approverPhoto) {
        this.approverPhoto = approverPhoto;
    }

    public String getUserFirstname() {
        return userFirstname;
    }

    public void setUserFirstname(String userFirstname) {
        this.userFirstname = userFirstname;
    }

    public String getUserLastname() {
        return userLastname;
    }

    public void setUserLastname(String userLastname) {
        this.userLastname = userLastname;
    }
}
