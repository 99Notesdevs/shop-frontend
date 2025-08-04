import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Table, Spin, Alert } from 'antd';
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

  // Prepare table columns and data
  const tableData = Object.entries(user)
    .filter(([key]) => !['firstName', 'lastName', 'email', 'id', '_id', '__v'].includes(key))
    .filter(([_, value]) => value !== null && value !== undefined && value !== '')
    .map(([key, value]) => ({
      key,
      field: key.split(/(?=[A-Z])/).join(' ').replace(/^./, str => str.toUpperCase()),
      value: typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)
    }));

  const columns = [
    {
      title: 'Field',
      dataIndex: 'field',
      key: 'field',
      width: '30%',
      render: (text: string) => <strong>{text}</strong>
    },
    {
      title: 'Value',
      dataIndex: 'value',
      key: 'value'
    }
  ];

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1rem' }}>
      <h1 style={{ marginBottom: '1.5rem' }}>User Profile</h1>
      <Card>
        <div style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ margin: 0 }}>
                {user.firstName} {user.lastName}
              </h2>
              <p style={{ color: '#666', margin: 0 }}>{user.email}</p>
            </div>
          </div>
          
          <h3 style={{ marginBottom: '1rem' }}>Account Details</h3>
          <Table 
            dataSource={tableData} 
            columns={columns} 
            pagination={false}
            bordered
            size="middle"
          />
          
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <Button type="primary" onClick={() => navigate('/profile/edit')}>
              Edit Profile
            </Button>
            <Button onClick={() => navigate(-1)}>
              Go Back
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
