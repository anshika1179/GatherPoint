package com.GatherPoint.backend.Security;

import com.GatherPoint.backend.Model.User;
import com.GatherPoint.backend.Repo.UserRepo;
import com.GatherPoint.backend.Constants.Role;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.Optional;

@Component
public class ClerkAuthenticationConverter implements Converter<Jwt, UsernamePasswordAuthenticationToken> {

    private final UserRepo userRepo;

    public ClerkAuthenticationConverter(UserRepo userRepo) {
        this.userRepo = userRepo;
    }

    @Override
    public UsernamePasswordAuthenticationToken convert(Jwt jwt) {
        // Clerk puts email inside the "email" claim or standard claims
        String email = jwt.getClaimAsString("email");
        if (email == null) {
            // Check other potential email claims in Clerk token or fallback to subject
            email = jwt.getClaimAsString("sub");
        }

        // Find or auto-provision user
        Optional<User> userOpt = userRepo.findByEmail(email);
        User user;
        if (userOpt.isPresent()) {
            user = userOpt.get();
        } else {
            // Auto-provision user since they are authenticated by Clerk
            String name = jwt.getClaimAsString("name");
            if (name == null) {
                name = "Clerk User";
            }
            user = User.builder()
                    .email(email)
                    .name(name)
                    .password("") // OAuth/Clerk users do not use local password
                    .role(Role.EMPLOYEE) // Default role
                    .active(true)
                    .build();
            user = userRepo.save(user);
        }

        SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + user.getRole().name());

        return new UsernamePasswordAuthenticationToken(
                user,
                jwt,
                Collections.singletonList(authority)
        );
    }
}
