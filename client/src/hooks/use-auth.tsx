import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import { User, InsertUser } from "@shared/schema";

// Define a simple version of the auth context
type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (user: InsertUser) => Promise<void>;
};

// Create the context with default values
export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  error: null,
  login: async () => {},
  logout: async () => {},
  register: async () => {},
});

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Login failed');
      }
      
      const userData = await response.json();
      setUser(userData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setIsLoading(true);
    setError(null);
    try {

// Update function
const update = async (data) => {
  setIsLoading(true);
  setError(null);
  try {
    const response = await fetch('/api/user/update', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Update failed');
    }

    const updatedUser = await response.json();
    setUser(updatedUser);
  } catch (err) {
    setError(err instanceof Error ? err : new Error('Unknown error'));
  } finally {
    setIsLoading(false);
  }
};

// Inside useAuth()
return {
  user,
  isLoading,
  error,
  login,
  logout,
  register,
  update, // Add update function to the context
};

      const response = await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Logout failed');
      }
      
      setUser(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (userData: InsertUser) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Registration failed');
      }
      
      const newUser = await response.json();
      setUser(newUser);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  // Load user data on initial mount
  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/user', {
          credentials: 'include',
        });
        
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (err) {
        // Silently fail - user not logged in
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAuth() {
  return useContext(AuthContext);
}
