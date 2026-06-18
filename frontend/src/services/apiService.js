// API Service - Centralized API calls
import { API_BASE_URL } from '../config';

// Global fetch interceptor to append JWT token automatically
const originalFetch = window.fetch;
window.fetch = async function (url, options = {}) {
  const urlString = typeof url === 'string' ? url : (url instanceof URL ? url.toString() : '');
  if (urlString.startsWith(API_BASE_URL)) {
    const token = localStorage.getItem('token');
    if (token) {
      options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`
      };
    }
  }
  return originalFetch(url, options);
};

class ApiService {
  // Auth endpoints
  static async login(email, password, role) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role }),
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Login failed');
    }
    return response.json();
  }

  static async signup(name, email, password, role) {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role }),
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Registration failed');
    }
    return response.json();
  }

  static async getToken() {
    const response = await fetch(`${API_BASE_URL}/auth/token`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
    });
    if (!response.ok) {
      throw new Error('Failed to get token');
    }
    return response.json();
  }

  static async refreshToken() {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: localStorage.getItem('token') }),
    });
    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }
    const data = await response.json();
    localStorage.setItem('token', data.token);
    return data;
  }

  // Public endpoints
  static async getCategories() {
    const response = await fetch(`${API_BASE_URL}/categories`);
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }
    return response.json();
  }

  static async getProducts() {
    const response = await fetch(`${API_BASE_URL}/products`);
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    return response.json();
  }

  static async getTables(floorId = null) {
    const url = floorId ? `${API_BASE_URL}/tables?floorId=${floorId}` : `${API_BASE_URL}/tables`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch tables');
    }
    return response.json();
  }

  static async getFloors() {
    const response = await fetch(`${API_BASE_URL}/floors`);
    if (!response.ok) {
      throw new Error('Failed to fetch floors');
    }
    return response.json();
  }

  static async createBooking(bookingData) {
    const response = await fetch(`${API_BASE_URL}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData),
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to create booking');
    }
    return response.json();
  }

  static async createCustomer(customerData) {
    const response = await fetch(`${API_BASE_URL}/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customerData),
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to create customer');
    }
    return response.json();
  }

  static async updateCustomer(id, customerData) {
    const response = await fetch(`${API_BASE_URL}/customers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customerData),
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to update customer');
    }
    return response.json();
  }

  static async deleteCustomer(id) {
    const response = await fetch(`${API_BASE_URL}/customers/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to delete customer');
    }
    return response.json();
  }

  static async createOrder(orderData) {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to create order');
    }
    return response.json();
  }

  static async getOrders() {
    const response = await fetch(`${API_BASE_URL}/orders`);
    if (!response.ok) {
      throw new Error('Failed to fetch orders');
    }
    return response.json();
  }

  static async getKitchenTickets() {
    const response = await fetch(`${API_BASE_URL}/kitchen/orders`);
    if (!response.ok) {
      throw new Error('Failed to fetch kitchen tickets');
    }
    return response.json();
  }

  static async getCustomers() {
    const response = await fetch(`${API_BASE_URL}/customers`);
    if (!response.ok) {
      throw new Error('Failed to fetch customers');
    }
    return response.json();
  }

  static async getEmployees() {
    const response = await fetch(`${API_BASE_URL}/employees`);
    if (!response.ok) {
      throw new Error('Failed to fetch employees');
    }
    return response.json();
  }

  static async getCoupons() {
    const response = await fetch(`${API_BASE_URL}/coupons`);
    if (!response.ok) {
      throw new Error('Failed to fetch coupons');
    }
    return response.json();
  }

  static async getPromotions() {
    const response = await fetch(`${API_BASE_URL}/promotions`);
    if (!response.ok) {
      throw new Error('Failed to fetch promotions');
    }
    return response.json();
  }

  static async getPayments() {
    const response = await fetch(`${API_BASE_URL}/payments`);
    if (!response.ok) {
      throw new Error('Failed to fetch payments');
    }
    return response.json();
  }

  static async getPaymentMethods() {
    const response = await fetch(`${API_BASE_URL}/payment-methods`);
    if (!response.ok) {
      throw new Error('Failed to fetch payment methods');
    }
    return response.json();
  }

  static async getBookings() {
    const response = await fetch(`${API_BASE_URL}/bookings`);
    if (!response.ok) {
      throw new Error('Failed to fetch bookings');
    }
    return response.json();
  }

  static async getReports(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    const query = params.toString();
    const url = `${API_BASE_URL}/reports/filtered${query ? '?' + query : ''}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch reports');
    }
    return response.json();
  }

  static async exportReports(type) {
    window.open(`${API_BASE_URL}/reports/export/${type}`, '_blank');
  }

  // Admin endpoints
  static async createProduct(productData) {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to create product');
    }
    return response.json();
  }

  static async updateProduct(id, productData) {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to update product');
    }
    return response.json();
  }

  static async deleteProduct(id) {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to delete product');
    }
    return response.json();
  }

  static async createCategory(categoryData) {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(categoryData),
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to create category');
    }
    return response.json();
  }

  static async updateCategory(id, categoryData) {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(categoryData),
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to update category');
    }
    return response.json();
  }

  static async deleteCategory(id) {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to delete category');
    }
    return response.json();
  }

  static async createEmployee(employeeData) {
    const response = await fetch(`${API_BASE_URL}/employees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(employeeData),
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to create employee');
    }
    return response.json();
  }

  static async updateEmployee(id, employeeData) {
    const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(employeeData),
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to update employee');
    }
    return response.json();
  }

  static async deleteEmployee(id) {
    const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to delete employee');
    }
    return response.json();
  }

  static async createCoupon(couponData) {
    const response = await fetch(`${API_BASE_URL}/coupons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(couponData),
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to create coupon');
    }
    return response.json();
  }

  static async updateCoupon(id, couponData) {
    const response = await fetch(`${API_BASE_URL}/coupons/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(couponData),
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to update coupon');
    }
    return response.json();
  }

  static async deleteCoupon(id) {
    const response = await fetch(`${API_BASE_URL}/coupons/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to delete coupon');
    }
    return response.json();
  }

  static async createPromotion(promotionData) {
    const response = await fetch(`${API_BASE_URL}/promotions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(promotionData),
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to create promotion');
    }
    return response.json();
  }

  static async updatePromotion(id, promotionData) {
    const response = await fetch(`${API_BASE_URL}/promotions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(promotionData),
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to update promotion');
    }
    return response.json();
  }

  static async deletePromotion(id) {
    const response = await fetch(`${API_BASE_URL}/promotions/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to delete promotion');
    }
    return response.json();
  }

  static async createPaymentMethod(paymentMethodData) {
    const response = await fetch(`${API_BASE_URL}/payment-methods`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentMethodData),
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to create payment method');
    }
    return response.json();
  }

  static async updatePaymentMethod(id, paymentMethodData) {
    const response = await fetch(`${API_BASE_URL}/payment-methods/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentMethodData),
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to update payment method');
    }
    return response.json();
  }

  static async deletePaymentMethod(id) {
    const response = await fetch(`${API_BASE_URL}/payment-methods/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to delete payment method');
    }
    return response.json();
  }

  static async togglePaymentMethod(id) {
    const response = await fetch(`${API_BASE_URL}/payment-methods/${id}/toggle`, {
      method: 'PATCH',
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to toggle payment method');
    }
    return response.json();
  }

  static async createSession(sessionData) {
    const response = await fetch(`${API_BASE_URL}/session/open`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sessionData),
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to create session');
    }
    return response.json();
  }

  static async closeSession(sessionId, closingAmount) {
    const response = await fetch(`${API_BASE_URL}/session/close`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ closingAmount }),
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to close session');
    }
    return response.json();
 }

  static async getActiveSession() {
    const response = await fetch(`${API_BASE_URL}/session/active`);
    if (!response.ok) {
      return null;
    }
    return response.json();
  }

  static async getSessionHistory() {
    const response = await fetch(`${API_BASE_URL}/session/history`);
    if (!response.ok) {
      throw new Error('Failed to fetch session history');
    }
    return response.json();
  }

  static async syncOfflineOrders(orders) {
    const response = await fetch(`${API_BASE_URL}/orders/sync-offline`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orders),
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to sync offline orders');
    }
    return response.json();
  }

  static async payCash(orderId, amount, amountPaid = amount, change = 0) {
    const response = await fetch(`${API_BASE_URL}/payments/cash`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, amount, amountPaid, change }),
    });
    if (!response.ok) throw new Error('Cash payment failed');
    return response.json();
  }

  static async payCard(orderId, amount, transactionReference) {
    const response = await fetch(`${API_BASE_URL}/payments/card`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, amount, transactionReference }),
    });
    if (!response.ok) throw new Error('Card payment failed');
    return response.json();
  }

  static async payUpi(orderId, amount, transactionReference) {
    const response = await fetch(`${API_BASE_URL}/payments/upi`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, amount, transactionReference }),
    });
    if (!response.ok) throw new Error('UPI payment failed');
    return response.json();
  }

  static async toggleOfflineSelling(id, enabled) {
    const response = await fetch(`${API_BASE_URL}/employees/${id}/offline-selling`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled }),
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to update offline selling');
    }
    return response.json();
  }

  static async sendReceipt(orderId, email) {
    const response = await fetch(`${API_BASE_URL}/payments/${orderId}/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to send receipt');
    }
    return response.json();
}

  static async updateKitchenTicket(id, stage) {
    const response = await fetch(`${API_BASE_URL}/kitchen/orders/${id}/prepare`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage }),
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to update kitchen ticket');
    }
    return response.json();
}

  static async completeKitchenTicket(id) {
    const response = await fetch(`${API_BASE_URL}/kitchen/orders/${id}/complete`, {
      method: 'PATCH',
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to complete kitchen ticket');
    }
    return response.json();
}

  static async sendOrderToKitchen(orderId) {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/send`, {
      method: 'POST',
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to send order to kitchen');
    }
    return response.json();
  }

  static async deleteOrder(id) {
    const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to delete order');
    }
    return response.json();
  }

  static async archiveEmployee(id) {
    const response = await fetch(`${API_BASE_URL}/employees/${id}/archive`, {
      method: 'PATCH',
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to archive employee');
    }
    return response.json();
  }

  static async changeEmployeePassword(id, password) {
    const response = await fetch(`${API_BASE_URL}/employees/${id}/password`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to change employee password');
    }
    return response.json();
  }

  static async createBookingFromOrder(orderId) {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/create-booking`, {
      method: 'POST',
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to create booking from order');
    }
    return response.json();
  }
}

export default ApiService;