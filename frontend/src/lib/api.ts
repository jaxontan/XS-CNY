const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface ApiOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: unknown;
    token?: string;
}

// Get CSRF token from cookies
function getCsrfToken(): string {
    if (typeof document === 'undefined') return '';
    const match = document.cookie.match(/csrf_token=([^;]+)/);
    return match ? match[1] : '';
}

export async function api<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const { method = 'GET', body, token } = options;

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };

    // Add CSRF token for state-changing requests
    if (['POST', 'PUT', 'DELETE'].includes(method)) {
        const csrfToken = getCsrfToken();
        if (csrfToken) {
            headers['X-CSRF-Token'] = csrfToken;
        }
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        credentials: 'include',
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(error.message || 'Request failed');
    }

    return response.json();
}

// Product types
export interface Product {
    $id: string;
    name: string;
    price: number;
    category: string;
    stock: number;
    description?: string;
    images?: string[];
}

// Auth types
export interface User {
    _id: string;
    name: string;
    email: string;
    csrfToken?: string;
}

// Order types - simplified for backend
export interface CreateOrderItem {
    product_id: string;
    quantity: number;
}

// Full order item returned from API
export interface OrderItem {
    product_id: string;
    name: string;
    price: number;
    quantity: number;
}

export interface ShippingAddress {
    street: string;
    city: string;
    postal_code: string;
    country: 'Singapore' | 'Malaysia';
}

// Order creation payload - supports guest checkout
export interface CreateOrderPayload {
    items: CreateOrderItem[];
    shipping_address: ShippingAddress;
    delivery_method: 'delivery' | 'pickup';
    guest_email?: string;  // For guest checkout
    guest_name?: string;   // For guest checkout
}

export interface Order {
    $id: string;
    user_id: string;
    items: OrderItem[];
    shipping_address: ShippingAddress;
    delivery_method: 'delivery' | 'pickup';
    total: number;
    status: string;
    guest_token?: string;
}

// API functions
export const productApi = {
    getAll: (params?: { category?: string; minPrice?: number; maxPrice?: number }) => {
        const query = new URLSearchParams();
        if (params?.category) query.set('category', params.category);
        if (params?.minPrice) query.set('minPrice', params.minPrice.toString());
        if (params?.maxPrice) query.set('maxPrice', params.maxPrice.toString());
        const queryStr = query.toString();
        return api<Product[]>(`/products${queryStr ? `?${queryStr}` : ''}`);
    },
    getOne: (id: string) => api<Product>(`/products/${id}`),
};

export const authApi = {
    register: (data: { name: string; email: string; password: string }) =>
        api<User>('/auth/register', { method: 'POST', body: data }),
    login: (data: { email: string; password: string }) =>
        api<User>('/auth/login', { method: 'POST', body: data }),
    logout: () => api('/auth/logout', { method: 'POST' }),
    getMe: () => api<User>('/auth/me'),
    refreshCsrf: () => api<{ csrfToken: string }>('/auth/csrf'),
};

export const orderApi = {
    // BUG-004 FIX: Only send product_id and quantity, not name/price
    create: (data: { items: CreateOrderItem[]; shipping_address: ShippingAddress; delivery_method: 'delivery' | 'pickup' }) =>
        api<Order>('/orders', { method: 'POST', body: data }),
    // BUG-001 FIX: Correct route path
    getMyOrders: () => api<Order[]>('/orders/my-orders'),
    getOne: (id: string, guestToken?: string) => {
        const query = guestToken ? `?guest_token=${guestToken}` : '';
        return api<Order>(`/orders/${id}${query}`);
    },
};
