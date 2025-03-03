package com.rif.backend.Security.jwt;

import io.jsonwebtoken.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import com.rif.backend.Auth.User;
import com.rif.backend.Security.UserDetailsImpl;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class JwtUtils {
    @Value("${rif.app.jwtSecret}")
    private String jwtSecret;

    @Value("${rif.app.jwtExpirationMs}")
    private int jwtExpirationMs;

    @Value("${rif.app.jwtPasswordResetExpirationMs}")
    private int jwtPasswordResetExpirationMs;

    public String generateJwtToken(Authentication authentication, boolean isNewUser) {
        UserDetailsImpl userPrincipal = (UserDetailsImpl) authentication.getPrincipal();

        List<String> roles = userPrincipal.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

        return Jwts.builder()
                .setSubject((userPrincipal.getUsername()))
                .claim("roles", roles)
                .claim("firstname", userPrincipal.getFirstname())
                .claim("lastname", userPrincipal.getLastname())
                .claim("isNewUser", isNewUser) // Add the isNewUser claim
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .signWith(SignatureAlgorithm.HS512, jwtSecret)
                .compact();
    }

    public String generateJwtTokenForPasswordReset(User user) {
        return Jwts.builder()
                .setSubject(user.getEmail())
                .claim("firstname", user.getFirstname())
                .claim("lastname", user.getLastname())
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + jwtPasswordResetExpirationMs))
                .signWith(SignatureAlgorithm.HS512, jwtSecret)
                .compact();
    }

    public String getUserNameFromJwtToken(String token) {
        return Jwts.parser().setSigningKey(jwtSecret).parseClaimsJws(token).getBody().getSubject();
    }

    public List<String> getRolesFromJwtToken(String token) {
        return Jwts.parser().setSigningKey(jwtSecret).parseClaimsJws(token).getBody().get("roles", List.class);
    }

    public boolean validateJwtToken(String authToken) {
        try {
            Jwts.parser().setSigningKey(jwtSecret).parseClaimsJws(authToken);
            return true;
        } catch (SignatureException e) {
            System.out.println("Invalid JWT signature: " + e.getMessage());
        } catch (MalformedJwtException e) {
            System.out.println("Invalid JWT token: " + e.getMessage());
        } catch (ExpiredJwtException e) {
            System.out.println("JWT token is expired: " + e.getMessage());
        } catch (UnsupportedJwtException e) {
            System.out.println("JWT token is unsupported: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            System.out.println("JWT claims string is empty: " + e.getMessage());
        }

        return false;
    }
}
