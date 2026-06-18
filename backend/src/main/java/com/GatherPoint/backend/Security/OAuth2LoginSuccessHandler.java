package com.GatherPoint.backend.Security;

import com.GatherPoint.backend.Model.User;
import com.GatherPoint.backend.Repo.UserRepo;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepo userRepo;
    private final JwtUtil jwtUtil;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        OAuth2AuthenticationToken token = (OAuth2AuthenticationToken) authentication;
        String email = token.getPrincipal().getAttribute("email");
        String name = token.getPrincipal().getAttribute("name");

        if (email == null) {
            response.sendRedirect(frontendUrl + "/oauth2/redirect?error=no_email");
            return;
        }

        Optional<User> userOpt = userRepo.findByEmail(email);
        if (userOpt.isEmpty()) {
            response.sendRedirect(frontendUrl + "/oauth2/redirect?error=customer");
            return;
        }

        User user = userOpt.get();
        user.setName(name != null ? name : user.getName());
        user = userRepo.save(user);

        String jwt = jwtUtil.generateToken(user.getEmail());
        String redirectUrl = String.format(frontendUrl + "/oauth2/redirect?token=%s&email=%s&name=%s&role=%s",
                URLEncoder.encode(jwt, StandardCharsets.UTF_8),
                URLEncoder.encode(user.getEmail(), StandardCharsets.UTF_8),
                URLEncoder.encode(user.getName(), StandardCharsets.UTF_8),
                user.getRole().name());

        response.sendRedirect(redirectUrl);
    }
}