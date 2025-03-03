package com.rif.backend.Auth;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.rif.backend.Payload.JwtResponse;
import com.rif.backend.Payload.MessageResponse;
import com.rif.backend.Payload.SignupRequest;
import com.rif.backend.Payload.ForgotPasswordRequest;
import com.rif.backend.Payload.PasswordResetRequest;
import com.rif.backend.Security.UserDetailsImpl;
import com.rif.backend.Security.jwt.JwtUtils;

import javax.validation.Valid;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@CrossOrigin(origins = "${cors.urls}", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    RoleRepository roleRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    // @Autowired
    // CaptchaService captchaService;

    @Autowired
    EmailService emailService;

    @Autowired
    private UserService userService;

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {

        // if (!captchaService.verifyCaptcha(loginRequest.getCaptchaValue())) {
        //     return ResponseEntity.badRequest().body(new MessageResponse("CAPTCHA verification failed"));
        // }

        Optional<User> userOptional = userRepository.findByEmail(loginRequest.getEmail());
        if (!userOptional.isPresent()) {
            return ResponseEntity.status(401).body(new MessageResponse("Error: Invalid email or password"));
        }

        User user = userOptional.get();
        if (!user.isActive()) {
            return ResponseEntity.status(403).body(new MessageResponse("Account is disabled"));
        }

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));
            SecurityContextHolder.getContext().setAuthentication(authentication);
            boolean isNewUser = user.isNewUser(); // Assuming user has this field
            String jwt = jwtUtils.generateJwtToken(authentication, isNewUser);

            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            List<String> roles = userDetails.getAuthorities().stream()
                    .map(item -> item.getAuthority())
                    .collect(Collectors.toList());

            return ResponseEntity.ok(new JwtResponse(jwt,
                                                    userDetails.getId(),
                                                    userDetails.getEmail(),
                                                    userDetails.getFirstname(),
                                                    userDetails.getLastname(),
                                                    roles));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(new MessageResponse("Incorrect password"));
        }
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Email is already taken!"));
        }

        // Create new user's account
        User user = new User(signUpRequest.getEmail(),
                             signUpRequest.getFirstname(),
                             signUpRequest.getLastname(),
                             encoder.encode(signUpRequest.getPassword()));

        user.setNewUser(true); // Set the isNewUser flag

        Set<String> strRoles = signUpRequest.getRole();
        Set<Role> roles = new HashSet<>();

        if (strRoles == null) {
            Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                    .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
            roles.add(userRole);
        } else {
            strRoles.forEach(role -> {
                switch (role) {
                    case "admin":
                        Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                        roles.add(adminRole);
                        break;
                    case "approver":
                        Role approverRole = roleRepository.findByName(ERole.ROLE_APPROVER)
                                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                        roles.add(approverRole);
                        break;
                    case "auditor":
                        Role auditorRole = roleRepository.findByName(ERole.ROLE_AUDITOR)
                                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                        roles.add(auditorRole);
                        break;
                    default:
                        Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                        roles.add(userRole);
                }
            });
        }

        user.setRoles(roles);
        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest forgotPasswordRequest) {
        Optional<User> userOptional = userRepository.findByEmail(forgotPasswordRequest.getEmail());
        if (!userOptional.isPresent()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Email not found!"));
        }

        User user = userOptional.get();
        String token = jwtUtils.generateJwtTokenForPasswordReset(user);
        emailService.sendPasswordResetEmail(user.getEmail(), token);

        return ResponseEntity.ok(new MessageResponse("Password reset email sent!"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody PasswordResetRequest passwordResetRequest) {
        String token = passwordResetRequest.getToken();
        String email = jwtUtils.getUserNameFromJwtToken(token);

        Optional<User> userOptional = userRepository.findByEmail(email);
        if (!userOptional.isPresent()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Invalid token."));
        }

        User user = userOptional.get();
        user.setPassword(encoder.encode(passwordResetRequest.getNewPassword()));
        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("Password reset successful!"));
    }

    @GetMapping("/check-email")
    public ResponseEntity<?> checkEmail(@RequestParam String email) {
        boolean exists = userService.checkEmailExists(email);
        return ResponseEntity.ok().body(Collections.singletonMap("exists", exists));
    }
}
