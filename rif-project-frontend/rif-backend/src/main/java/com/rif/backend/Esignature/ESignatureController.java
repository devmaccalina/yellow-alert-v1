package com.rif.backend.Esignature;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;

@RestController
@RequestMapping("/api/esignatures")
public class ESignatureController {

    @Autowired
    private ESignatureService service;

    @PostMapping("/upload")
    public ResponseEntity<ESignature> uploadESignature(
            @RequestParam("professionalTitle") String professionalTitle,
            @RequestParam("postNominalTitle") String postNominalTitle,
            @RequestParam(value = "file", required = false) MultipartFile file,
            Principal principal) throws Exception {

        ESignature eSignature = new ESignature();
        eSignature.setProfessionalTitle(professionalTitle);
        eSignature.setPostNominalTitle(postNominalTitle);
        if (file != null) {
            eSignature.setESignaturePhoto(file.getBytes());
        }

        ESignature savedESignature = service.saveOrUpdateESignature(eSignature, principal.getName());
        return ResponseEntity.ok(savedESignature);
    }

    @GetMapping
    public ResponseEntity<ESignature> getESignature(Principal principal) {
        ESignature eSignature = service.getESignatureByEmail(principal.getName());
        if (eSignature == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(eSignature);
    }

    @GetMapping("/image")
    public ResponseEntity<byte[]> getESignatureImage(Principal principal) {
        ESignature eSignature = service.getESignatureByEmail(principal.getName());
        if (eSignature == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG)
                .body(eSignature.getESignaturePhoto());
    }

    @GetMapping("/status")
    public ResponseEntity<Boolean> isEsignatureComplete(Principal principal) {
        boolean isComplete = service.isEsignatureComplete(principal.getName());
        return ResponseEntity.ok(isComplete);
    }
}
