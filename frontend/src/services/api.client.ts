import env from '@/config/env';

/**
 * Cliente HTTP base para todas las llamadas a la API
 */

type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number>;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    method: HTTPMethod = 'GET',
    options: RequestOptions = {}
  ): Promise<T> {
    const { params, body, ...fetchOptions } = options;

    // Construir URL con query params si existen
    let url = `${this.baseURL}${endpoint}`;
    if (params) {
      const queryString = new URLSearchParams(
        Object.entries(params).map(([key, value]) => [key, String(value)])
      ).toString();
      url += `?${queryString}`;
    }

    const headers: Record<string, string> = { ...fetchOptions.headers as any };

    // Add Authorization header if token exists
    const token = localStorage.getItem('edu_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Si el body no es FormData, ponemos el content-type por defecto
    if (!(body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const config: RequestInit = {
      method,
      headers,
      body,
      ...fetchOptions,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        // Try to parse the JSON error body so callers can read custom codes
        let errorData: any = {};
        try {
          const errText = await response.text();
          if (errText) errorData = JSON.parse(errText);
        } catch (_) { /* ignore */ }

        // Global intercept for expired/invalid sessions
        if (
          response.status === 401 &&
          ['AUTH_REQUIRED', 'TOKEN_EXPIRED', 'INVALID_TOKEN'].includes(errorData?.code)
        ) {
          window.dispatchEvent(new CustomEvent('auth:expired', { detail: errorData }));
        } else if (response.status === 401) {
          // Si es un 401 genérico de una vista subordinada, solo lo logueamos pero no cerramos toda la app de golpe
          console.warn(`[ApiClient] 401 Unauthorized for ${endpoint}. Detail:`, errorData);
        }

        // Global intercept for suspended accounts (stricter check to prevent false positives)
        if (errorData?.code === 'ACCOUNT_SUSPENDED') {
          window.dispatchEvent(new CustomEvent('account:suspended', { detail: errorData }));
        }

        const err: any = new Error(`HTTP Error: ${response.status} ${response.statusText}`);
        err.status = response.status;
        err.data = errorData;
        throw err;
      }

      // Si no hay contenido (status 204), retornar respuesta vacía
      if (response.status === 204) {
        return {} as T;
      }

      // Obtener el texto de la respuesta primero para verificar si está vacío
      const text = await response.text();
      if (!text) {
        return {} as T;
      }

      try {
        return JSON.parse(text);
      } catch (e) {
        console.error("Failed to parse JSON response:", text);
        throw e;
      }
    } catch (error) {
      console.error(`API Request Error [${method} ${endpoint}]:`, error);
      throw error;
    }
  }

  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, 'GET', options);
  }

  async post<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    const processedBody = body instanceof FormData ? body : (body ? JSON.stringify(body) : undefined);
    return this.request<T>(endpoint, 'POST', {
      ...options,
      body: processedBody as any,
    });
  }

  async put<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    const processedBody = body instanceof FormData ? body : (body ? JSON.stringify(body) : undefined);
    return this.request<T>(endpoint, 'PUT', {
      ...options,
      body: processedBody as any,
    });
  }

  async patch<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    const processedBody = body instanceof FormData ? body : (body ? JSON.stringify(body) : undefined);
    return this.request<T>(endpoint, 'PATCH', {
      ...options,
      body: processedBody as any,
    });
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, 'DELETE', options);
  }
}

// Instancia singleton del cliente API
export const apiClient = new ApiClient(env.API_BASE_URL);

export default apiClient;
