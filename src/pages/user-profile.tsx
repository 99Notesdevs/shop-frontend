import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Spin, Alert } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

interface UserData {
  id?: string | number;
  _id?: string | number;
  __v?: any;
  firstName?: string;
  lastName?: string;
  email?: string;
  [key: string]: any; // For any additional user properties
}

export default function UserProfile() {
  const { fetchUserDetails, fetchUserData } = useAuth();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        // Fetch both user details and additional user data
        const [userDetails, userData] = await Promise.all([
          fetchUserDetails(),
          fetchUserData()
        ]);
        
        if (!userDetails) {
          setError('Failed to load user details');
          return;
        }

        // Combine the data from both endpoints
        setUser({
          ...userDetails,
          // Add any additional fields from userData if needed
          ...(userData || {})
        });
      } catch (err) {
        console.error('Error loading user data:', err);
        setError('An error occurred while loading user data');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [fetchUserDetails, fetchUserData]);

  // Modified data preparation
  const profileData = Object.entries(user || {})
    .filter(([key]) => !['firstName', 'lastName', 'email', 'id', '_id', '__v'].includes(key))
    .filter(([_, value]) => value !== null && value !== undefined && value !== '');

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
        <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1rem' }}>
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: '1rem' }}
        />
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Button type="primary" onClick={() => window.location.reload()}>
            Try Again
          </Button>
          <Button onClick={() => navigate('/')}>
            Go to Home
          </Button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1rem' }}>
        <Alert
          message="No User Data"
          description="No user data available. Please log in to view your profile."
          type="warning"
          showIcon
          style={{ marginBottom: '1rem' }}
        />
        <Button type="primary" onClick={() => navigate('/login')}>
          Go to Login
        </Button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1rem' }}>
      {user && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Hero Section */}
          <div 
            style={{ 
              background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
              borderRadius: '16px',
              padding: '2rem',
              color: 'white',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h1 style={{ 
                fontSize: '2.5rem', 
                margin: '0 0 0.5rem 0',
                fontWeight: 600
              }}>
                {user.firstName} {user.lastName}
              </h1>
              <p style={{ 
                fontSize: '1.1rem',
                margin: 0,
                opacity: 0.9
              }}>
                {user.email}
              </p>
            </div>
          </div>

          {/* Profile Details Section */}
          <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
            {profileData.map(([key, value]) => (
              <Card
                key={key}
                style={{ 
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  transition: 'transform 0.2s ease-in-out',
                  cursor: 'default'
                }}
                hoverable
              >
                <h3 style={{ 
                  margin: '0 0 0.5rem 0',
                  color: '#1890ff',
                  fontSize: '1.1rem',
                  textTransform: 'capitalize'
                }}>
                  {key.split(/(?=[A-Z])/).join(' ')}
                </h3>
                <p style={{ 
                  margin: 0,
                  fontSize: '1rem',
                  color: '#262626',
                  wordBreak: 'break-word'
                }}>
                  {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                </p>
              </Card>
            ))}
          </div>

          {/* Action Buttons */}
          <div style={{ 
            display: 'flex', 
            gap: '1rem', 
            marginTop: '1rem',
            justifyContent: 'flex-start'
          }}>
            <Button 
              type="primary" 
              size="large"
              onClick={() => navigate('/profile/edit')}
              style={{
                borderRadius: '8px',
                padding: '0 2rem'
              }}
            >
              Edit Profile
            </Button>
            <Button 
              size="large"
              onClick={() => navigate(-1)}
              style={{
                borderRadius: '8px',
                padding: '0 2rem'
              }}
            >
              Go Back
            </Button>
          </div>
        </div>
      )}

      {/* Keep existing loading, error, and no-user states */}
      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
          <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
        </div>
      )}
      
      {error && (
        <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1rem' }}>
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: '1rem' }}
          />
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Button type="primary" onClick={() => window.location.reload()}>
              Try Again
            </Button>
            <Button onClick={() => navigate('/')}>
              Go to Home
            </Button>
          </div>
        </div>
      )}
      
      {!user && !loading && !error && (
        <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1rem' }}>
          <Alert
            message="No User Data"
            description="No user data available. Please log in to view your profile."
            type="warning"
            showIcon
            style={{ marginBottom: '1rem' }}
          />
          <Button type="primary" onClick={() => navigate('/login')}>
            Go to Login
          </Button>
        </div>
      )}
    </div>
  );
}
