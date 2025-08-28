import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api/route';
import { useNavigate } from 'react-router-dom';
import {Button, Card, Spin, Tag, Avatar, Typography, Modal, Form, Input, Checkbox } from 'antd';
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
  PlusOutlined,
  CheckCircleOutlined,
  CheckOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { message } from 'antd';

const { Title, Text } = Typography;

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
  const [error, setError] = useState<{message: string; details?: string} | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const navigate = useNavigate();
  
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  const fetchAddresses = async () => {
    try {
      setLoadingAddresses(true);
      setError(null);
      const response = await api.get(`/address/`) as { success: boolean; data: Address[] };
      
      if (!response.success) {
        throw new Error('Failed to fetch addresses. Please try again later.');
      }
      
      const data = response.data;
      setAddresses(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError({
        message: 'Failed to load addresses',
        details: errorMessage
      });
      message.error('Failed to load addresses');
    } finally {
      setLoadingAddresses(false);
    }
  };

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        setError(null);
        // Fetch both user details and additional user data
        const [userDetails, userData] = await Promise.all([
          fetchUserDetails(),
          fetchUserData()
        ]);
        
        if (!userDetails) {
          throw new Error('Failed to load user profile. Please try again.');
        }

        // Combine the data from both endpoints
        const userDataCombined = {
          ...userDetails,
          ...(userData || {})
        };
        
        setUser(userDataCombined);
        
        // Fetch addresses after user data is loaded
        await fetchAddresses();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
        setError({
          message: 'Failed to load profile',
          details: errorMessage
        });
        message.error('Failed to load user profile');
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
      setIsSubmitting(true);
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
      await fetchAddresses();
      
      handleCancel();
    } catch (error) {
      console.error('Error saving address:', error);
      message.error('Failed to save address');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (addressId: string) => {
    try {
      await api.delete(`/address/${addressId}`);
      message.success('Address deleted successfully');
      
      // Refresh addresses
      await fetchAddresses();
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
      await fetchAddresses();
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
            <Input addonBefore="+91" style={{ width: '100%' }} />
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
          <Button 
            type="primary" 
            loading={isSubmitting}
            onClick={handleSubmit}
          >
            {editingAddress ? 'Update Address' : 'Add Address'}
          </Button>
        </div>
      </Form>
    </Modal>
  );

  const renderProfileTab = () => (
    <div className="p-6 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <Title level={3} className="m-0">Profile Information</Title>
          <Text type="secondary">Manage your personal information and preferences</Text>
        </div>
        <Button 
          type="primary"
          icon={<EditOutlined />}
          onClick={() => navigate('/profile/edit')}
        >
          Edit Profile
        </Button>
      </div>

      <div className="space-y-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card 
            hoverable 
            className="text-center h-full transition-all hover:shadow-md border hover:border-blue-100"
            onClick={() => navigate('/myorders')}
          >
            <div className="bg-blue-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingOutlined className="text-xl text-blue-500" />
            </div>
            <Title level={5} className="m-0 mb-1">My Orders</Title>
            <Text type="secondary" className="text-sm">Track, return, or buy things again</Text>
          </Card>
          
          <Card 
            hoverable 
            className="text-center h-full transition-all hover:shadow-md border hover:border-green-100"
            onClick={() => setActiveTab('addresses')}
          >
            <div className="bg-green-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <HomeOutlined className="text-xl text-green-500" />
            </div>
            <Title level={5} className="m-0 mb-1">My Addresses</Title>
            <Text type="secondary" className="text-sm">Edit addresses for orders</Text>
          </Card>
          
          <Card 
            hoverable 
            className="text-center h-full transition-all hover:shadow-md border hover:border-orange-100"
            onClick={() => navigate('/contact')}
          >
            <div className="bg-orange-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <InfoCircleOutlined className="text-xl text-orange-500" />
            </div>
            <Title level={5} className="m-0 mb-1">Help & Support</Title>
            <Text type="secondary" className="text-sm">Contact our customer service</Text>
          </Card>
        </div>

        {/* Profile Details */}
        <Card className="border-0 shadow-sm">
          <Title level={4} className="mb-6">Personal Information</Title>
          <div className="space-y-6">
            {profileData.map((item) => (
              <div key={item.key} className="flex flex-col sm:flex-row gap-4 py-3 border-b border-gray-100 last:border-0 last:pb-0">
                <Text className="w-full sm:w-1/4 text-gray-600 font-medium">
                  {item.label}:
                </Text>
                <div className="w-full sm:w-3/4">
                  {item.key === 'paidUser' ? (
                    <Tag 
                      color={item.value === 'Premium User' ? 'gold' : 'default'} 
                      className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {item.value}
                    </Tag>
                  ) : item.key === 'validTill' ? (
                    <div className="flex items-center gap-2 text-gray-800">
                      <CalendarOutlined className="text-gray-400" />
                      <span>{item.value}</span>
                    </div>
                  ) : (
                    <Text className="text-gray-800">{item.value}</Text>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );

  const renderAddressesTab = () => {
    if (loadingAddresses) {
      return (
        <div className="flex justify-center items-center py-20">
          <Spin indicator={<LoadingOutlined style={{ fontSize: 32 }} spin />} />
        </div>
      );
    }

    if (addresses.length === 0) {
      return (
        <div className="text-center py-16 px-4">
          <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <EnvironmentOutlined className="text-3xl text-gray-400" />
          </div>
          <Title level={4} className="mb-2">No Addresses Found</Title>
          <Text type="secondary" className="block mb-6 max-w-md mx-auto">
            You haven't added any addresses yet. Add your first address to get started.
          </Text>
          <Button 
            type="primary"
            size="large"
            className="flex items-center gap-2 mx-auto"
            onClick={() => showModal()}
          >
            <PlusOutlined />
            Add New Address
          </Button>
        </div>
      );
    }

    return (
      <div className="p-6 md:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <Title level={3} className="m-0">My Addresses</Title>
            <Text type="secondary">Manage your saved addresses</Text>
          </div>
          <Button 
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => showModal()}
            className="w-full sm:w-auto"
          >
            Add New Address
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <Card 
              key={address._id}
              className="h-full border hover:shadow-md transition-shadow"
              bodyStyle={{ padding: '24px' }}
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    {address.isDefault && (
                      <Tag color="blue" className="m-0">
                        Default
                      </Tag>
                    )}
                    <Text strong className="text-lg m-0">
                      {address.name || 'Home'}
                    </Text>
                  </div>
                  <Button 
                    type="text" 
                    icon={<EditOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      showModal(address);
                    }}
                    className="text-gray-500 hover:bg-gray-50"
                  />
                </div>
                
                <div className="space-y-2 text-gray-700">
                  <div className="flex items-start gap-2">
                    <EnvironmentOutlined className="mt-1 text-gray-400" />
                    <div>
                      <p className="m-0">{address.addressLine1}</p>
                      {address.addressLine2 && <p className="m-0">{address.addressLine2}</p>}
                      <p className="m-0">
                        {address.city}, {address.state} {address.postalCode}
                      </p>
                      <p className="m-0">{address.country}</p>
                      {address.phoneNumber && (
                        <p className="mt-1">
                          <PhoneOutlined className="mr-2 text-gray-400" />
                          {address.phoneNumber}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button 
                    size="small"
                    type={address.isDefault ? 'default' : 'text'}
                    disabled={address.isDefault}
                    onClick={() => handleSetDefault(address.id)}
                    className={`flex items-center gap-1 ${!address.isDefault ? 'text-blue-600 hover:text-blue-700' : ''}`}
                  >
                    {address.isDefault ? (
                      <CheckCircleOutlined className="text-green-500" />
                    ) : (
                      <CheckOutlined />
                    )}
                    {address.isDefault ? 'Default Address' : 'Set as Default'}
                  </Button>
                  
                  <Button 
                    type="text" 
                    danger 
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => {
                      Modal.confirm({
                        title: 'Delete Address',
                        content: 'Are you sure you want to delete this address?',
                        okText: 'Delete',
                        okType: 'danger',
                        cancelText: 'Cancel',
                        onOk: () => handleDelete(address.id),
                        icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
                        centered: true,
                      });
                    }}
                    className="hover:bg-red-50"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const ErrorBoundary = ({ error }: { error: {message: string; details?: string} | null }) => {
    if (!error) return null;
    
    return (
      <div className="mb-4 p-4 rounded-md bg-red-50 border border-red-200">
        <div className="flex">
          <div className="flex-shrink-0">
            <ExclamationCircleOutlined className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">{error.message}</h3>
            {error.details && (
              <div className="mt-2 text-sm text-red-700">
                <p>{error.details}</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <Card 
              key={address._id}
              className="h-full border hover:shadow-md transition-shadow"
              bodyStyle={{ padding: '24px' }}
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    {address.isDefault && (
                      <Tag color="blue" className="m-0">
                        Default
                      </Tag>
                    )}
                    <Text strong className="text-lg m-0">
                      {address.name || 'Home'}
                    </Text>
                  </div>
                  <Button 
                    type="text" 
                    icon={<EditOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      showModal(address);
                    }}
                    className="text-gray-500 hover:bg-gray-50"
                  />
                </div>
                
                <div className="space-y-2 text-gray-700">
                  <div className="flex items-start gap-2">
                    <EnvironmentOutlined className="mt-1 text-gray-400" />
                    <div>
                      <p className="m-0">{address.addressLine1}</p>
                      {address.addressLine2 && <p className="m-0">{address.addressLine2}</p>}
                      <p className="m-0">
                        {address.city}, {address.state} {address.postalCode}
                      </p>
                      <p className="m-0">{address.country}</p>
                      {address.phoneNumber && (
                        <p className="mt-1">
                          <PhoneOutlined className="mr-2 text-gray-400" />
                          {address.phoneNumber}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button 
                    size="small"
                    type={address.isDefault ? 'default' : 'text'}
                    disabled={address.isDefault}
                    onClick={() => handleSetDefault(address.id)}
                    className={`flex items-center gap-1 ${!address.isDefault ? 'text-blue-600 hover:text-blue-700' : ''}`}
                  >
                    {address.isDefault ? (
                      <CheckCircleOutlined className="text-green-500" />
                    ) : (
                      <CheckOutlined />
                    )}
                    {address.isDefault ? 'Default Address' : 'Set as Default'}
                  </Button>
                  
                  <Button 
                    type="text" 
                    danger 
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => {
                      Modal.confirm({
                        title: 'Delete Address',
                        content: 'Are you sure you want to delete this address?',
                        okText: 'Delete',
                        okType: 'danger',
                        cancelText: 'Cancel',
                        onOk: () => handleDelete(address.id),
                        icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
                        centered: true,
                      });
                    }}
                    className="hover:bg-red-50"
                  >
                    Delete
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
      <div className="flex justify-center items-center min-h-screen">
        <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ErrorBoundary error={error} />
      {renderAddressForm()}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
              <div className="text-center mb-6">
                <Avatar 
                  size={120} 
                  icon={<UserOutlined />} 
                  className="bg-blue-50 text-blue-500 text-5xl mx-auto mb-4"
                />
                <Title level={4} className="m-0">{user?.firstName} {user?.lastName}</Title>
                <Text type="secondary" className="text-sm">{user?.email}</Text>
                <Text type="secondary" className="text-sm">{user?.phone}</Text>
              </div>
              
              <div className="space-y-1">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${activeTab === 'profile' ? 'bg-blue-50 text-blue-600 font-medium' : 'hover:bg-gray-50'}`}
                >
                  <UserOutlined className="mr-3" />
                  Profile Information
                </button>
                <button
                  onClick={() => setActiveTab('addresses')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center justify-between ${activeTab === 'addresses' ? 'bg-blue-50 text-blue-600 font-medium' : 'hover:bg-gray-50'}`}
                >
                  <span><HomeOutlined className="mr-3" /> My Addresses</span>
                  <span className="bg-blue-100 text-blue-600 text-xs font-medium px-2 py-1 rounded-full">
                    {addresses.length}
                  </span>
                </button>
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {activeTab === 'profile' ? renderProfileTab() : renderAddressesTab()}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}