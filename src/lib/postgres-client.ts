// Cliente PostgreSQL customizado para substituir Supabase
import { User } from '@/types/auth';

interface PostgresConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
}

class PostgresClient {
  private config: PostgresConfig;
  private baseUrl: string;

  constructor(config?: PostgresConfig) {
    this.config = config || {
      host: 'localhost',
      port: 5432,
      database: 'threatpulse',
      username: 'postgres',
      password: 'postgres123'
    };
    
    // Para ambiente de produção, usar API REST
    this.baseUrl = process.env.NODE_ENV === 'production' 
      ? '/api/db' 
      : 'http://localhost:3001/api/db';
  }

  // Simular interface do Supabase Auth
  auth = {
    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      try {
        const response = await fetch(`${this.baseUrl}/auth/signin`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          return { data: null, error: { message: data.message || 'Login failed' } };
        }
        
        // Salvar sessão no localStorage
        if (data.session) {
          localStorage.setItem('auth_session', JSON.stringify(data.session));
          localStorage.setItem('auth_user', JSON.stringify(data.user));
        }
        
        return { data, error: null };
      } catch (error) {
        return { data: null, error: { message: 'Network error' } };
      }
    },

    signUp: async ({ email, password, options }: { 
      email: string; 
      password: string; 
      options?: { data?: any } 
    }) => {
      try {
        const response = await fetch(`${this.baseUrl}/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email, 
            password, 
            name: options?.data?.name 
          })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          return { data: null, error: { message: data.message || 'Signup failed' } };
        }
        
        // Auto-login após signup
        if (data.session) {
          localStorage.setItem('auth_session', JSON.stringify(data.session));
          localStorage.setItem('auth_user', JSON.stringify(data.user));
        }
        
        return { data, error: null };
      } catch (error) {
        return { data: null, error: { message: 'Network error' } };
      }
    },

    signOut: async () => {
      try {
        const session = localStorage.getItem('auth_session');
        if (session) {
          await fetch(`${this.baseUrl}/auth/signout`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${JSON.parse(session).access_token}`
            }
          });
        }
        
        localStorage.removeItem('auth_session');
        localStorage.removeItem('auth_user');
        
        return { error: null };
      } catch (error) {
        // Limpar mesmo com erro
        localStorage.removeItem('auth_session');
        localStorage.removeItem('auth_user');
        return { error: null };
      }
    },

    getSession: async () => {
      try {
        const session = localStorage.getItem('auth_session');
        const user = localStorage.getItem('auth_user');
        
        if (!session || !user) {
          return { data: { session: null }, error: null };
        }
        
        const sessionData = JSON.parse(session);
        const userData = JSON.parse(user);
        
        // Verificar se sessão não expirou
        if (sessionData.expires_at && new Date(sessionData.expires_at) < new Date()) {
          localStorage.removeItem('auth_session');
          localStorage.removeItem('auth_user');
          return { data: { session: null }, error: null };
        }
        
        return { 
          data: { 
            session: { 
              ...sessionData, 
              user: userData 
            } 
          }, 
          error: null 
        };
      } catch (error) {
        return { data: { session: null }, error: null };
      }
    },

    onAuthStateChange: (callback: (event: string, session: any) => void) => {
      // Simular listener de mudança de auth
      const checkAuth = () => {
        const session = localStorage.getItem('auth_session');
        const user = localStorage.getItem('auth_user');
        
        if (session && user) {
          const sessionData = JSON.parse(session);
          const userData = JSON.parse(user);
          
          callback('SIGNED_IN', {
            ...sessionData,
            user: userData
          });
        } else {
          callback('SIGNED_OUT', null);
        }
      };
      
      // Verificar imediatamente
      setTimeout(checkAuth, 100);
      
      // Listener para mudanças no localStorage
      const storageListener = (e: StorageEvent) => {
        if (e.key === 'auth_session' || e.key === 'auth_user') {
          checkAuth();
        }
      };
      
      window.addEventListener('storage', storageListener);
      
      return {
        data: {
          subscription: {
            unsubscribe: () => {
              window.removeEventListener('storage', storageListener);
            }
          }
        }
      };
    },

    resetPasswordForEmail: async (email: string, options?: any) => {
      // Simular reset de senha
      try {
        const response = await fetch(`${this.baseUrl}/auth/reset-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, ...options })
        });
        
        if (!response.ok) {
          const data = await response.json();
          return { error: { message: data.message || 'Reset failed' } };
        }
        
        return { error: null };
      } catch (error) {
        return { error: { message: 'Network error' } };
      }
    },

    updateUser: async (updates: any) => {
      // Simular atualização de usuário
      try {
        const session = localStorage.getItem('auth_session');
        if (!session) {
          return { error: { message: 'Not authenticated' } };
        }

        const response = await fetch(`${this.baseUrl}/auth/update-user`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${JSON.parse(session).access_token}`
          },
          body: JSON.stringify(updates)
        });
        
        if (!response.ok) {
          const data = await response.json();
          return { error: { message: data.message || 'Update failed' } };
        }
        
        const data = await response.json();
        
        // Atualizar dados locais
        localStorage.setItem('auth_user', JSON.stringify(data.user));
        
        return { data: data.user, error: null };
      } catch (error) {
        return { error: { message: 'Network error' } };
      }
    }
  };

  // Simular interface do Supabase Database
  from = (table: string) => {
    return {
      select: (columns: string = '*') => ({
        eq: (column: string, value: any) => ({
          single: async () => this.query(`SELECT ${columns} FROM ${table} WHERE ${column} = $1 LIMIT 1`, [value]),
          maybeSingle: async () => this.query(`SELECT ${columns} FROM ${table} WHERE ${column} = $1 LIMIT 1`, [value], true)
        })
      }),
      
      insert: (data: any) => ({
        select: async () => this.query(
          `INSERT INTO ${table} (${Object.keys(data).join(', ')}) VALUES (${Object.keys(data).map((_, i) => `$${i + 1}`).join(', ')}) RETURNING *`,
          Object.values(data)
        )
      }),
      
      update: (data: any) => ({
        eq: (column: string, value: any) => ({
          select: async () => this.query(
            `UPDATE ${table} SET ${Object.keys(data).map((key, i) => `${key} = $${i + 1}`).join(', ')} WHERE ${column} = $${Object.keys(data).length + 1} RETURNING *`,
            [...Object.values(data), value]
          )
        })
      }),
      
      delete: () => ({
        eq: (column: string, value: any) => ({
          select: async () => this.query(`DELETE FROM ${table} WHERE ${column} = $1 RETURNING *`, [value])
        })
      })
    };
  };

  private async query(sql: string, params: any[] = [], allowEmpty = false) {
    try {
      const session = localStorage.getItem('auth_session');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (session) {
        headers['Authorization'] = `Bearer ${JSON.parse(session).access_token}`;
      }
      
      const response = await fetch(`${this.baseUrl}/query`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ sql, params })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        return { data: null, error: { message: result.message || 'Database error' } };
      }
      
      if (result.rows.length === 0 && !allowEmpty) {
        return { data: null, error: { message: 'No data found' } };
      }
      
      return { data: result.rows[0] || null, error: null };
    } catch (error) {
      return { data: null, error: { message: 'Network error' } };
    }
  }
}

// Instância global (pode ser configurada via environment)
export const postgres = new PostgresClient();

// Para compatibilidade, exportar como supabase
export const supabase = postgres;