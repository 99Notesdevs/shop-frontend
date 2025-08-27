import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api/route';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button'; 
import { Card, Spin, Alert, Tabs, Tag, Avatar, Space, Typography, Modal, Form, Input, Checkbox } from 'antd';
import { 
  LoadingOutlined, 
  UserOutlined, 
  ShoppingOutlined, 
  HomeOutlined, 
  InfoCircleOutlined, 
  PhoneOutlined, 
  EnvironmentOutlined,
  EditOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { message } from 'antd';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface Address {
  id: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  [key: string]: any;
}

interface UserData {
  id?: string | number
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  addresses?: Address[];
}

export default function UserProfile() {
  const { fetchUserDetails, fetchUserData } = useAuth();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  const navigate = useNavigate();
  
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  const fetchAddresses = async (userId: string) => {
    try {
      setLoadingAddresses(true);
      const response = await api.get(`/address/${userId}`)as { success: boolean; data: Address[] };
      
      if (!response.success) {
        throw new Error('Failed to fetch addresses');
      }
      
      const data = response.data;
      setAddresses(data);
    } catch (error) {
      console.error('Error fetching addresses:', error);
      // You might want to show a toast or error message here
    } finally {
      setLoadingAddresses(false);
    }
  };

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
        const userDataCombined = {
          ...userDetails,
          ...(userData || {})
        };
        
        setUser(userDataCombined);
        
        // Fetch addresses after user data is loaded
        if (userDataCombined.id) {
          await fetchAddresses(String(userDataCombined.id));
        }
      } catch (err) {
        console.error('Error loading user data:', err);
        setError('An error occurred while loading user data');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [fetchUserDetails, fetchUserData]);

  // Filter out system fields and format profile data
  const profileData = Object.entries(user || {})
    .filter(([key]) => !['id', 'addresses', 'createdAt', 'updatedAt', 'Userdata'].includes(key))
    .filter(([_, value]) => value !== null && value !== undefined && value !== '')
    .map(([key, value]) => {
      let displayValue = String(value);
      let icon = 'info';
      
      // Handle specific field types
      if (key === 'email') {
        icon = 'mail';
      } else if (key === 'phone') {
        icon = 'phone';
      } else if (typeof value === 'object' && value !== null) {
        // Format object values as a readable list
        if (key === 'tagsCovered' && Array.isArray(value)) {
          displayValue = value.join(', ');
        } else if (key === 'validTill') {
          displayValue = new Date(value).toLocaleDateString();
        } else if (key === 'paidUser') {
          displayValue = value ? 'Premium User' : 'Free User';
          icon = value ? 'crown' : 'user';
        } else {
          // For other objects, try to display them nicely
          try {
            displayValue = Object.entries(value)
              .map(([k, v]) => `${k}: ${v}`)
              .join(' • ');
          } catch (e) {
            displayValue = 'View Details';
          }
        }
      }
      
      return {
        key,
        value: displayValue,
        icon,
        label: key.split(/(?=[A-Z])/).map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ')
      };
    });

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [form] = Form.useForm();

  const showModal = (address: Address | null = null) => {
    setEditingAddress(address);
    if (address) {
      form.setFieldsValue({
        name: address.name,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2 || '',
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
        phoneNumber: address.phoneNumber,
        isDefault: address.isDefault
      });
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setEditingAddress(null);
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingAddress) {
        // Update existing address
        await api.put(`/address/${editingAddress.id}`, values);
        message.success('Address updated successfully');
      } else {
        // Create new address
        await api.post('/address', values);
        message.success('Address added successfully');
      }
      
      // Refresh addresses
      if (user?.id) {
        await fetchAddresses(String(user.id));
      }
      
      handleCancel();
    } catch (error) {
      console.error('Error saving address:', error);
      message.error('Failed to save address');
    }
  };

  const handleDelete = async (addressId: string) => {
    try {
      await api.delete(`/address/${addressId}`);
      message.success('Address deleted successfully');
      
      // Refresh addresses
      if (user?.id) {
        await fetchAddresses(String(user.id));
      }
    } catch (error) {
      console.error('Error deleting address:', error);
      message.error('Failed to delete address');
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      await api.put(`/address/${addressId}/set-default`);
      message.success('Default address updated');
      
      // Refresh addresses
      if (user?.id) {
        await fetchAddresses(String(user.id));
      }
    } catch (error) {
      console.error('Error setting default address:', error);
      message.error('Failed to set default address');
    }
  };

  const renderAddressForm = () => (
    <Modal
      title={editingAddress ? 'Edit Address' : 'Add New Address'}
      open={isModalVisible}
      onCancel={handleCancel}
      footer={null}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          isDefault: false
        }}
      >
        <Form.Item
          name="name"
          label="Full Name"
          rules={[{ required: true, message: 'Please enter your full name' }]}
        >
          <Input placeholder="John Doe" />
        </Form.Item>
        
        <Form.Item
          name="addressLine1"
          label="Address Line 1"
          rules={[{ required: true, message: 'Please enter your address' }]}
        >
          <Input placeholder="123 Main St" />
        </Form.Item>
        
        <Form.Item
          name="addressLine2"
          label="Address Line 2 (Optional)"
        >
          <Input placeholder="Apt, suite, etc." />
        </Form.Item>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item
            name="city"
            label="City"
            rules={[{ required: true, message: 'Please enter your city' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="state"
            label="State/Province/Region"
            rules={[{ required: true, message: 'Please enter your state' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="postalCode"
            label="Postal Code"
            rules={[{ required: true, message: 'Please enter your postal code' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="country"
            label="Country"
            rules={[{ required: true, message: 'Please select your country' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="phoneNumber"
            label="Phone Number"
            rules={[{ required: true, message: 'Please enter your phone number' }]}
          >
            <Input addonBefore="+1" style={{ width: '100%' }} />
          </Form.Item>
        </div>
        
        <Form.Item
          name="isDefault"
          valuePropName="checked"
        >
          <Checkbox>Set as default address</Checkbox>
        </Form.Item>
        
        <div className="flex justify-end space-x-4 mt-6">
          <Button onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {editingAddress ? 'Update Address' : 'Add Address'}
          </Button>
        </div>
      </Form>
    </Modal>
  );

  const renderProfileTab = () => (
    <div className="space-y-6">
      {/* User Info Card */}
      <Card className="shadow-md mb-8">
        <div className="flex flex-col md:flex-row items-center md:items-start md:space-x-6 space-y-4 md:space-y-0">
          <Avatar 
            size={100} 
            icon={<UserOutlined />} 
            className="bg-blue-100 text-blue-600 text-4xl flex-shrink-0"
          />
          <div className="text-center md:text-left">
            <Title level={3} className="m-0 mb-2">{user.firstName} {user.lastName}</Title>
            <div className="space-y-2">
              <div className="flex items-center justify-center md:justify-start space-x-2">
                <InfoCircleOutlined className="text-gray-400" />
                <Text type="secondary" className="text-base">{user.email}</Text>
              </div>
              {user.phone && (
                <div className="flex items-center justify-center md:justify-start space-x-2">
                  <PhoneOutlined className="text-gray-400" />
                  <Text type="secondary" className="text-base">{user.phone}</Text>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mt-8">
        <Card 
          hoverable 
          className="text-center"
          onClick={() => navigate('/orders')}
        >
          <ShoppingOutlined className="text-3xl text-blue-500 mb-2" />
          <Title level={5} className="m-0">My Orders</Title>
          <Text type="secondary">Track, return, or buy things again</Text>
        </Card>
        
        <Card 
          hoverable 
          className="text-center"
          onClick={() => setActiveTab('addresses')}
        >
          <HomeOutlined className="text-3xl text-green-500 mb-2" />
          <Title level={5} className="m-0">My Addresses</Title>
          <Text type="secondary">Edit addresses for orders</Text>
        </Card>
        
        <Card 
          hoverable 
          className="text-center"
          onClick={() => navigate('/contact')}
        >
          <InfoCircleOutlined className="text-3xl text-orange-500 mb-2" />
          <Title level={5} className="m-0">Help & Support</Title>
          <Text type="secondary">Contact our customer service</Text>
        </Card>
      </div>

      {/* Profile Details */}
      <Card title="Profile Information" className="shadow-sm mt-8" headStyle={{ borderBottom: '1px solid #f0f0f0' }}>
        <div className="space-y-4">
          {profileData.map((item) => (
            <div key={item.key} className="flex flex-col sm:flex-row gap-2 py-2 border-b border-gray-100 last:border-0 last:pb-0">
              <Text strong className="w-full sm:w-1/4 text-gray-600">
                {item.label}:
              </Text>
              <div className="w-full sm:w-3/4">
                {item.key === 'paidUser' ? (
                  <Tag color={item.value === 'Premium User' ? 'gold' : 'default'} className="capitalize">
                    {item.value}
                  </Tag>
                ) : item.key === 'validTill' ? (
                  <div className="flex items-center gap-2">
                    <CalendarOutlined className="text-gray-400" />
                    <span>{item.value}</span>
                  </div>
                ) : (
                  <Text className="break-words">{item.value}</Text>
                )}
              </div>
            </div>
          ))}
        </div>
        <Button 
          variant="outline"
          className="mt-4 flex items-center gap-2"
          onClick={() => navigate('/profile/edit')}
        >
          <EditOutlined />
          <span>Edit Profile</span>
        </Button>
      </Card>
    </div>
  );

  const renderAddressesTab = () => {
    if (loadingAddresses) {
      return (
        <div className="flex justify-center items-center py-12">
          <Spin indicator={<LoadingOutlined style={{ fontSize: 32 }} spin />} />
        </div>
      );
    }

    if (addresses.length === 0) {
      return (
        <div className="text-center py-12">
          <EnvironmentOutlined className="text-5xl text-gray-300 mb-4" />
          <Title level={4}>No Addresses Found</Title>
          <Text type="secondary" className="block mb-4">
            You haven't added any addresses yet.
          </Text>
          <Button 
            variant="outline"
            className="mt-4 flex items-center gap-2"
            onClick={() => showModal()}
          >
            Add New Address
          </Button>
        </div>
      );
    }

    return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Title level={4} className="m-0">My Addresses</Title>
        <Button 
          variant="outline"
          className="mt-4 flex items-center gap-2"
          onClick={() => showModal()}
        >
          Add New Address
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {addresses.map((address) => (
          <Card 
            key={address._id}
            className="h-full"
            hoverable
          >
            <div className="space-y-2">
              <div className="flex justify-between">
                <Text strong className="text-lg">
                  {address.isDefault && <Tag color="blue" className="mr-2">Default</Tag>}
                  {address.addressLine1}
                </Text>
                <Button variant="outline" size="sm" className="p-1">
                  <EditOutlined />
                </Button>
              </div>
              {address.addressLine2 && <div>{address.addressLine2}</div>}
              <div>{address.city}, {address.state} {address.postalCode}</div>
              <div>{address.country}</div>
              <div className="pt-2 flex space-x-2">
                <Button 
                  size="sm" 
                  variant={address.isDefault ? 'secondary' : 'outline'}
                  disabled={address.isDefault}
                  onClick={() => handleSetDefault(address.id)}
                >
                  {address.isDefault ? 'Default Address' : 'Set as Default'}
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive"
                  className="text-destructive-foreground hover:text-destructive-foreground"
                  onClick={() => {
                    Modal.confirm({
                      title: 'Delete Address',
                      content: 'Are you sure you want to delete this address?',
                      okText: 'Yes, delete it',
                      okType: 'danger',
                      cancelText: 'No, keep it',
                      onOk: () => handleDelete(address.id)
                    });
                  }}
                >
                  Delete
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="p-1"
                  onClick={() => showModal(address)}
                >
                  <EditOutlined />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
  };

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
          <Button onClick={() => window.location.reload()}>
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
        <Button onClick={() => navigate('/login')}>
          Go to Login
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {renderAddressForm()}
      <Title level={2} className="mb-6">My Account</Title>
      
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        className="profile-tabs"
      >
        <TabPane tab={
          <span><UserOutlined /> Profile</span>
        } key="profile">
          {renderProfileTab()}
        </TabPane>
        
        <TabPane tab={
          <span><HomeOutlined /> Addresses <Tag color="blue">{addresses.length}</Tag></span>
        } key="addresses">
          {renderAddressesTab()}
        </TabPane>
      </Tabs>

      {loading && (
        <div className="flex justify-center items-center min-h-[70vh]">
          <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
        </div>
      )}
      
      {error && (
        <div className="max-w-3xl mx-auto my-8 px-4">
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            className="mb-4"
          />
          <Space>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
            <Button onClick={() => navigate('/')}>
              Go to Home
            </Button>
          </Space>
        </div>
      )}
      
      {!user && !loading && !error && (
        <div className="max-w-3xl mx-auto my-8 px-4">
          <Alert
            message="No User Data"
            description="No user data available. Please log in to view your profile."
            type="warning"
            showIcon
            className="mb-4"
          />
          <Button onClick={() => navigate('/login')}>
            Go to Login
          </Button>
        </div>
      )}
    </div>
  );
}
