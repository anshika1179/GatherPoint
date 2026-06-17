package com.GatherPoint.backend.Service;

import com.GatherPoint.backend.dto.Request.PaymentMethodRequest;
import com.GatherPoint.backend.dto.Response.PaymentMethodResponse;

import java.util.List;

public interface PaymentMethodService {
    List<PaymentMethodResponse> getAll();
    PaymentMethodResponse create(PaymentMethodRequest request);
    PaymentMethodResponse update(Long id, PaymentMethodRequest request);
    void delete(Long id);
    List<PaymentMethodResponse> getEnabled();
    PaymentMethodResponse toggle(Long id);
}
