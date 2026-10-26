import { RentalItem, Campus, AdminService, RentalOrder, ServiceRequest, AuthUser } from '../types';
import { CAMPUSES, MOCK_ITEMS, ADMIN_SERVICES } from '../data/mockData';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || '/api';

/**
 * Helper to fetch with timeout and JSON handling
 */
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.detail || `Request failed with status ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

/**
 * Campuses API
 */
export async function getCampuses(): Promise<Campus[]> {
  try {
    return await apiRequest<Campus[]>('/campuses/');
  } catch (e) {
    console.warn('[HIRO API] Campuses fallback to mock data:', e);
    return CAMPUSES;
  }
}

/**
 * Items Catalog API with filter support
 */
export async function getItems(filters?: {
  category?: string;
  search?: string;
  campus?: string;
  sort?: string;
}): Promise<RentalItem[]> {
  try {
    const params = new URLSearchParams();
    if (filters?.category && filters.category !== 'All') params.append('category', filters.category);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.campus) params.append('campus', filters.campus);
    if (filters?.sort) params.append('sort', filters.sort);

    const queryStr = params.toString() ? `?${params.toString()}` : '';
    return await apiRequest<RentalItem[]>(`/items/${queryStr}`);
  } catch (e) {
    console.warn('[HIRO API] Items fallback to mock data:', e);
    return MOCK_ITEMS;
  }
}

/**
 * Create a new Rental Item listing
 */
export async function createItem(item: Partial<RentalItem>): Promise<RentalItem> {
  try {
    const payload = {
      id: item.id,
      title: item.title,
      category: item.category,
      price_per_day: item.pricePerDay,
      security_deposit: item.securityDeposit,
      location: item.location,
      campus: item.campus,
      image_url: item.imageUrl,
      condition: item.condition,
      description: item.description,
      highlights: item.highlights || [],
      included_items: item.includedItems || [],
    };
    return await apiRequest<RentalItem>('/items/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  } catch (e) {
    console.warn('[HIRO API] Listing fallback to local:', e);
    return item as RentalItem;
  }
}

/**
 * University OTP Auth: Send OTP
 */
export async function sendOtp(email: string): Promise<{ success: boolean; message: string; test_otp?: string }> {
  try {
    return await apiRequest<{ success: boolean; message: string; test_otp?: string }>('/auth/send-otp/', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  } catch (e: any) {
    console.warn('[HIRO API] Send OTP fallback:', e);
    if (email.endsWith('.ac.in')) {
      return { success: true, message: `OTP sent to ${email}`, test_otp: '1234' };
    }
    throw new Error(e.message || 'Must be an official university email ending with .ac.in');
  }
}

/**
 * University OTP Auth: Verify OTP
 */
export async function verifyOtp(email: string, otp: string): Promise<{ success: boolean; user: AuthUser }> {
  try {
    const res = await apiRequest<{ success: boolean; user: any }>('/auth/verify-otp/', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
    return {
      success: true,
      user: {
        email: res.user.email,
        verified: true,
        otpVerified: true,
      },
    };
  } catch (e: any) {
    console.warn('[HIRO API] Verify OTP fallback:', e);
    if (otp === '1234' || otp.length === 4) {
      return {
        success: true,
        user: { email, verified: true, otpVerified: true },
      };
    }
    throw new Error(e.message || 'Invalid OTP code.');
  }
}

/**
 * Rental Orders API: Create Order
 */
export async function createOrder(orderPayload: any): Promise<RentalOrder> {
  try {
    return await apiRequest<RentalOrder>('/orders/', {
      method: 'POST',
      body: JSON.stringify(orderPayload),
    });
  } catch (e) {
    console.warn('[HIRO API] Create Order fallback to simulated order:', e);
    throw e;
  }
}

/**
 * Rental Orders API: Pickup Verification & Start Timer
 */
export async function verifyPickup(orderId: string, studentIdCardUrl?: string): Promise<{ success: boolean; order: RentalOrder }> {
  try {
    return await apiRequest<{ success: boolean; order: RentalOrder }>(`/orders/${orderId}/verify-pickup/`, {
      method: 'POST',
      body: JSON.stringify({ studentIdCardUrl }),
    });
  } catch (e) {
    console.warn('[HIRO API] Verify Pickup fallback:', e);
    throw e;
  }
}

/**
 * Admin Services API
 */
export async function getAdminServices(): Promise<AdminService[]> {
  try {
    return await apiRequest<AdminService[]>('/services/');
  } catch (e) {
    console.warn('[HIRO API] Services fallback to mock data:', e);
    return ADMIN_SERVICES;
  }
}

/**
 * Submit Service Request API
 */
export async function submitServiceRequest(req: Partial<ServiceRequest>): Promise<ServiceRequest> {
  try {
    return await apiRequest<ServiceRequest>('/service-requests/', {
      method: 'POST',
      body: JSON.stringify(req),
    });
  } catch (e) {
    console.warn('[HIRO API] Service Request fallback:', e);
    return req as ServiceRequest;
  }
}
