package com.rif.backend.Auth;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public User registerUser(String email, String firstname, String lastname, String password, Set<ERole> strRoles) {
        User user = new User();
        user.setEmail(email);
        user.setFirstname(firstname);
        user.setLastname(lastname);
        user.setPassword(passwordEncoder.encode(password));

        Set<Role> roles = new HashSet<>();
        for (ERole role : strRoles) {
            Role foundRole = roleRepository.findByName(role).orElseThrow(() -> new RuntimeException("Error: Role is not found."));
            roles.add(foundRole);
        }
        user.setRoles(roles);
        return userRepository.save(user);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public boolean checkEmailExists(String email) {
        return userRepository.existsByEmail(email);
    }
}
