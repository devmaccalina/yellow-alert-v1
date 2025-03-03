package com.rif.backend.Auth;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@Service
public class CaptchaService {

    @Value("${recaptcha.secret}")
    private String secret;

    private static final String RECAPTCHA_VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";

    public boolean verifyCaptcha(String captchaResponse) {
        RestTemplate restTemplate = new RestTemplate();

        UriComponentsBuilder uriComponentsBuilder = UriComponentsBuilder.fromHttpUrl(RECAPTCHA_VERIFY_URL)
                .queryParam("secret", secret)
                .queryParam("response", captchaResponse);

        String response = restTemplate.postForObject(uriComponentsBuilder.toUriString(), null, String.class);

        return response != null && response.contains("\"success\": true");
    }
}
