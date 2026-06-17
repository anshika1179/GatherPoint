package com.GatherPoint.backend.dto.Request;

import lombok.Data;

@Data
public class ClerkLoginRequest {
    private String email;
    private String name;
    private String role;
}
