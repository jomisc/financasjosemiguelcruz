// API Client for Finanças+ Backend
// Replaces Supabase client with direct API calls

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface ApiError {
  error: string;
}

interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
}

// Generic fetch wrapper
async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      return {
        data: null,
        error: errorData,
      };
    }

    const data = await response.json();
    return {
      data,
      error: null,
    };
  } catch (error) {
    console.error('API Error:', error);
    return {
      data: null,
      error: { error: error instanceof Error ? error.message : 'Network error' },
    };
  }
}

// Categories API
export const categoriesApi = {
  async getAll() {
    return fetchApi<any[]>('/categories');
  },

  async create(category: { name: string; icon?: string; is_default?: boolean }) {
    return fetchApi<any>('/categories', {
      method: 'POST',
      body: JSON.stringify(category),
    });
  },
};

// Transactions API
export const transactionsApi = {
  async getAll(options?: { limit?: number; type?: string; category_id?: string }) {
    const params = new URLSearchParams();
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.type) params.append('type', options.type);
    if (options?.category_id) params.append('category_id', options.category_id);

    const queryString = params.toString();
    return fetchApi<any[]>(`/transactions${queryString ? `?${queryString}` : ''}`);
  },

  async create(transaction: {
    type: string;
    amount: number;
    category_id?: string;
    date?: string;
    description?: string;
  }) {
    return fetchApi<any>('/transactions', {
      method: 'POST',
      body: JSON.stringify(transaction),
    });
  },

  async update(id: string, transaction: {
    type?: string;
    amount?: number;
    category_id?: string;
    date?: string;
    description?: string;
  }) {
    return fetchApi<any>(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(transaction),
    });
  },

  async delete(id: string) {
    return fetchApi<any>(`/transactions/${id}`, {
      method: 'DELETE',
    });
  },
};

// Budgets API
export const budgetsApi = {
  async getAll(options?: { month?: number; year?: number }) {
    const params = new URLSearchParams();
    if (options?.month) params.append('month', options.month.toString());
    if (options?.year) params.append('year', options.year.toString());

    const queryString = params.toString();
    return fetchApi<any[]>(`/budgets${queryString ? `?${queryString}` : ''}`);
  },

  async create(budget: {
    category_id: string;
    amount: number;
    month: number;
    year: number;
  }) {
    return fetchApi<any>('/budgets', {
      method: 'POST',
      body: JSON.stringify(budget),
    });
  },

  async delete(id: string) {
    return fetchApi<any>(`/budgets/${id}`, {
      method: 'DELETE',
    });
  },
};

// Dashboard API
export const dashboardApi = {
  async getStats() {
    return fetchApi<{
      income: number;
      expenses: number;
      balance: number;
      budgets: any[];
    }>('/dashboard/stats');
  },
};

// Default export for backwards compatibility
export default {
  categories: categoriesApi,
  transactions: transactionsApi,
  budgets: budgetsApi,
  dashboard: dashboardApi,
};
