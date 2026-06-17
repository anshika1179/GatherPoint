package com.GatherPoint.backend.Service.Impl;

import com.GatherPoint.backend.Mapper.PaymentMethodMapper;
import com.GatherPoint.backend.Model.PaymentMethod;
import com.GatherPoint.backend.Repo.PaymentMethodRepo;
import com.GatherPoint.backend.Service.PaymentMethodService;
import com.GatherPoint.backend.dto.Request.PaymentMethodRequest;
import com.GatherPoint.backend.dto.Response.PaymentMethodResponse;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PaymentMethodServiceImpl implements PaymentMethodService {

    private final PaymentMethodRepo paymentMethodRepo;

    public PaymentMethodServiceImpl(PaymentMethodRepo paymentMethodRepo) {
        this.paymentMethodRepo = paymentMethodRepo;
    }

    @Override
    public List<PaymentMethodResponse> getAll() {
        return paymentMethodRepo.findAll().stream().map(PaymentMethodMapper::toResponse).collect(Collectors.toList());
    }

    @Override
    public PaymentMethodResponse create(PaymentMethodRequest request) {
        PaymentMethod paymentMethod = PaymentMethodMapper.toEntity(request);
        paymentMethod = paymentMethodRepo.save(paymentMethod);
        return PaymentMethodMapper.toResponse(paymentMethod);
    }

    @Override
    public PaymentMethodResponse update(Long id, PaymentMethodRequest request) {
        PaymentMethod paymentMethod = paymentMethodRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment method not found with id: " + id));
        PaymentMethodMapper.updateEntity(paymentMethod, request);
        paymentMethod = paymentMethodRepo.save(paymentMethod);
        return PaymentMethodMapper.toResponse(paymentMethod);
    }

    @Override
    public void delete(Long id) {
        paymentMethodRepo.deleteById(id);
    }

    @Override
    public List<PaymentMethodResponse> getEnabled() {
        return paymentMethodRepo.findByEnabledTrue().stream()
                .map(PaymentMethodMapper::toResponse).collect(Collectors.toList());
    }

    @Override
    public PaymentMethodResponse toggle(Long id) {
        PaymentMethod pm = paymentMethodRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment method not found with id: " + id));
        pm.setEnabled(!pm.isEnabled());
        pm = paymentMethodRepo.save(pm);
        return PaymentMethodMapper.toResponse(pm);
    }
}
