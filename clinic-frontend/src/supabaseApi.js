// Custom Supabase API wrapper using fetch instead of supabase-js client
// This bypasses the hanging issue with the Supabase JS client

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Get current session token
const getAuthToken = () => {
  const localStorageKey = `sb-${SUPABASE_URL.split('//')[1].split('.')[0]}-auth-token`;
  const sessionData = localStorage.getItem(localStorageKey);
  if (sessionData) {
    const { access_token } = JSON.parse(sessionData);
    return access_token;
  }
  return null;
};

// Base fetch wrapper
export const supabaseFetch = async (endpoint, options = {}) => {
  const authToken = getAuthToken();
  
  const headers = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${authToken || SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': options.prefer || 'return=representation',
    ...options.headers
  };

  const response = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
};

// Query builder helper
export const from = (table) => ({
  select: (columns = '*') => ({
    eq: (column, value) => ({
      order: (orderColumn, options = {}) => ({
        execute: () => {
          const params = new URLSearchParams();
          params.append('select', columns);
          params.append(column, `eq.${value}`);
          if (orderColumn) {
            params.append('order', `${orderColumn}.${options.ascending ? 'asc' : 'desc'}`);
          }
          return supabaseFetch(`${table}?${params.toString()}`);
        }
      }),
      limit: (count) => ({
        execute: () => {
          const params = new URLSearchParams();
          params.append('select', columns);
          params.append(column, `eq.${value}`);
          params.append('limit', count);
          return supabaseFetch(`${table}?${params.toString()}`);
        }
      }),
      execute: () => {
        const params = new URLSearchParams();
        params.append('select', columns);
        params.append(column, `eq.${value}`);
        return supabaseFetch(`${table}?${params.toString()}`);
      }
    }),
    order: (column, options = {}) => ({
      execute: () => {
        const params = new URLSearchParams();
        params.append('select', columns);
        params.append('order', `${column}.${options.ascending ? 'asc' : 'desc'}`);
        return supabaseFetch(`${table}?${params.toString()}`);
      }
    }),
    limit: (count) => ({
      execute: () => {
        const params = new URLSearchParams();
        params.append('select', columns);
        params.append('limit', count);
        return supabaseFetch(`${table}?${params.toString()}`);
      }
    }),
    execute: () => {
      const params = new URLSearchParams();
      params.append('select', columns);
      return supabaseFetch(`${table}?${params.toString()}`);
    }
  }),
  
  insert: (data) => ({
    execute: () => supabaseFetch(table, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }),
  
  update: (data) => ({
    eq: (column, value) => ({
      execute: () => {
        const params = new URLSearchParams();
        params.append(column, `eq.${value}`);
        return supabaseFetch(`${table}?${params.toString()}`, {
          method: 'PATCH',
          body: JSON.stringify(data)
        });
      }
    })
  }),
  
  delete: () => ({
    eq: (column, value) => ({
      execute: () => {
        const params = new URLSearchParams();
        params.append(column, `eq.${value}`);
        return supabaseFetch(`${table}?${params.toString()}`, {
          method: 'DELETE'
        });
      }
    })
  })
});
