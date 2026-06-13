package com.GatherPoint.backend.dto;

import com.GatherPoint.backend.Constants.Role;
import lombok.Data;

@Data
public class SignupRequest {
    private String name;
    private String email;
    private String password;
    private Role role;
}
