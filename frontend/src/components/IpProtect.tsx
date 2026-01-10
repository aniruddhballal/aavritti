import { useState, useEffect } from 'react';
import { api } from '../services';

export const IpProtect = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    verifyIpAddress();
  }, []);

  const verifyIpAddress = async () => {
    try {
      // Backend will automatically check the request IP
      const response = await api.get('/auth/verify-ip');
      
      if (response.status === 200 && response.data.success) {
        setIsAuthenticated(true);
        setError('');
      } else {
        setIsAuthenticated(false);
        setError('Access denied: IP address not authorized');
      }
    } catch (err: any) {
      console.error('IP verification failed:', err);
      setIsAuthenticated(false);
      setError(err.response?.data?.message || 'Access denied: IP address not authorized');
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        fontFamily: 'Arial, sans-serif'
      }}>
        Verifying access...
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
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f5f5f5'
    }}>
      <div style={{ 
        textAlign: 'center',
        maxWidth: '400px',
        padding: '30px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ color: '#d32f2f', marginBottom: '15px' }}>Access Denied</h2>
        <p style={{ color: '#666', lineHeight: '1.6' }}>{error}</p>
        <p style={{ color: '#999', fontSize: '14px', marginTop: '20px' }}>
          Your IP address is not authorized to access this application.
        </p>
      </div>
    </div>
  );
};