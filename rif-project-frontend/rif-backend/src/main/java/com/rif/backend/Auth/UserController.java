package com.rif.backend.Auth;

import com.rif.backend.Auth.User;
import com.rif.backend.Auth.UserRepository;
import com.rif.backend.Auth.RoleRepository;
import com.rif.backend.Auth.Role;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userRepository.findAll();
        return ResponseEntity.ok(users);
    }

    @PutMapping("/{userId}/roles")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> updateUserRole(@PathVariable Long userId, @RequestBody RoleUpdateRequest roleUpdateRequest) {
        Optional<User> userOptional = userRepository.findById(userId);
        if (!userOptional.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        Optional<Role> roleOptional = roleRepository.findById(roleUpdateRequest.getRoleId());
        if (!roleOptional.isPresent()) {
            return ResponseEntity.badRequest().build();
        }

        User user = userOptional.get();
        user.getRoles().clear();
        user.getRoles().add(roleOptional.get());
        userRepository.save(user);

        return ResponseEntity.ok(user);
    }

    @PutMapping("/{userId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> updateUserStatus(@PathVariable Long userId, @RequestBody StatusUpdateRequest statusUpdateRequest) {
        Optional<User> userOptional = userRepository.findById(userId);
        if (!userOptional.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        User user = userOptional.get();
        user.setActive(statusUpdateRequest.isActive());
        userRepository.save(user);

        return ResponseEntity.ok(user);
    }

    public static class StatusUpdateRequest {
        private boolean active;

        public boolean isActive() {
            return active;
        }

        public void setActive(boolean active) {
            this.active = active;
        }
    }

    public static class RoleUpdateRequest {
        private Long roleId;

        public Long getRoleId() {
            return roleId;
        }

        public void setRoleId(Long roleId) {
            this.roleId = roleId;
        }
    }
}
