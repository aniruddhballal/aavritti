import { useState, useEffect } from 'react';
import { api } from '../services';

export const PasswordProtect = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      verifyToken();
    } else {
      setIsLoading(false);
    }
  }, []);

  const verifyToken = async () => {
    try {
      const response = await api.get('/auth/verify');
      
      if (response.status === 200) {
        setIsAuthenticated(true);
      } else {
        // Token invalid, clear it and show login
        localStorage.removeItem('authToken');
        setIsAuthenticated(false);
      }
    } catch (error) {
      // Token verification failed (401 or network error)
      console.error('Token verification failed:', error);
      localStorage.removeItem('authToken');
      setIsAuthenticated(false);  // CHANGED: explicitly set to false
    } finally {
      setIsLoading(false);  // CHANGED: always stop loading
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await api.post('/auth/login', { password });
      
      if (response.data.success) {
        localStorage.setItem('authToken', response.data.token);
        setIsAuthenticated(true);
      } else {
        setError('Incorrect password');
        setPassword('');
      }
    } catch (err) {
      setError('Failed to authenticate');
      setPassword('');
    }
  };

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            fontSize: '18px', 
            color: '#333',
            marginBottom: '10px'
          }}>
            Verifying authentication...
          </div>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      padding: '20px',
      backgroundColor: '#f5f5f5'
    }}>
      <form onSubmit={handleSubmit} style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '15px',
        maxWidth: '300px',
        width: '100%',
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ margin: 0, textAlign: 'center' }}>Enter Password</h2>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          style={{ 
            padding: '10px', 
            fontSize: '16px',
            borderRadius: '4px',
            border: '1px solid #ccc'
          }}
          autoFocus
        />
        {error && <p style={{ color: 'red', margin: 0 }}>{error}</p>}
        <button 
          type="submit"
          style={{ 
            padding: '10px', 
            fontSize: '16px',
            borderRadius: '4px',
            cursor: 'pointer',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none'
          }}
        >
          Submit
        </button>
      </form>
    </div>
  );
};