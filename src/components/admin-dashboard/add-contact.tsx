"use client";

import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { toast } from '../../components/ui/toast';
import { Phone, Mail, MapPin, Building2, User, Globe} from 'lucide-react';

type FormData = {
  contactPerson: string;
  email: string;
  phone: string;
  companyName: string;
  website: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isPrimary: boolean;
  department: string;
  designation: string;
};

type FormErrors = {
  [key: string]: string;
};

export default function AddContactForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    contactPerson: '',
    email: '',
    phone: '',
    companyName: '',
    website: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    isPrimary: false,
    department: '',
    designation: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePhone = (phone: string) => {
    const re = /^[0-9+\-\s()]{10,}$/;
    return re.test(phone);
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};
    
    if (!formData.contactPerson?.trim()) {
      newErrors.contactPerson = 'Contact person is required';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (formData.phone && !validatePhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    if (!formData.companyName?.trim()) {
      newErrors.companyName = 'Company name is required';
    }
    
    if (!formData.address?.trim()) {
      newErrors.address = 'Address is required';
    }
    
    if (!formData.city?.trim()) {
      newErrors.city = 'City is required';
    }
    
    if (!formData.state?.trim()) {
      newErrors.state = 'State/Province is required';
    }
    
    if (!formData.postalCode?.trim()) {
      newErrors.postalCode = 'Postal code is required';
    }
    
    if (!formData.country?.trim()) {
      newErrors.country = 'Country is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsLoading(true);
      // Your existing form submission logic here
      console.log('Form submitted:', formData);
      // Reset form after successful submission
      setFormData({
        contactPerson: '',
        email: '',
        phone: '',
        companyName: '',
        website: '',
        address: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
        isPrimary: false,
        department: '',
        designation: ''
      });
      toast.success('Contact added successfully');
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to add contact');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Add New Contact</h2>
        <p className="text-muted-foreground">
          Add a new contact to your e-commerce store
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact Person */}
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Contact Person <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <Input
                placeholder="John Doe"
                className="pl-10"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleChange}
              />
            </div>
            {errors.contactPerson && (
              <p className="text-sm font-medium text-destructive">{errors.contactPerson}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Email <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <Input
                type="email"
                placeholder="contact@example.com"
                className="pl-10"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            {errors.email && (
              <p className="text-sm font-medium text-destructive">{errors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Phone <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <Input
                type="tel"
                placeholder="+1 (555) 000-0000"
                className="pl-10"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            {errors.phone && (
              <p className="text-sm font-medium text-destructive">{errors.phone}</p>
            )}
          </div>

          {/* Company Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Company Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <Input
                placeholder="Acme Inc."
                className="pl-10"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
              />
            </div>
            {errors.companyName && (
              <p className="text-sm font-medium text-destructive">{errors.companyName}</p>
            )}
          </div>

          {/* Website */}
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Website
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <Input
                type="url"
                placeholder="https://example.com"
                className="pl-10"
                name="website"
                value={formData.website}
                onChange={handleChange}
              />
            </div>
            {errors.website && (
              <p className="text-sm font-medium text-destructive">{errors.website}</p>
            )}
          </div>

          {/* Department */}
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Department
            </label>
            <Input
              placeholder="Sales, Support, etc."
              name="department"
              value={formData.department}
              onChange={handleChange}
            />
            {errors.department && (
              <p className="text-sm font-medium text-destructive">{errors.department}</p>
            )}
          </div>

          {/* Designation */}
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Designation
            </label>
            <Input
              placeholder="Manager, Executive, etc."
              name="designation"
              value={formData.designation}
              onChange={handleChange}
            />
            {errors.designation && (
              <p className="text-sm font-medium text-destructive">{errors.designation}</p>
            )}
          </div>

          {/* Address */}
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Street Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              <Input
                placeholder="123 Main St"
                className="pl-10"
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
            </div>
            {errors.address && (
              <p className="text-sm font-medium text-destructive">{errors.address}</p>
            )}
          </div>

          {/* City */}
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              City <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="New York"
              name="city"
              value={formData.city}
              onChange={handleChange}
            />
            {errors.city && (
              <p className="text-sm font-medium text-destructive">{errors.city}</p>
            )}
          </div>

          {/* State */}
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              State/Province <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="New York"
              name="state"
              value={formData.state}
              onChange={handleChange}
            />
            {errors.state && (
              <p className="text-sm font-medium text-destructive">{errors.state}</p>
            )}
          </div>

          {/* Postal Code */}
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Postal Code <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="10001"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
            />
            {errors.postalCode && (
              <p className="text-sm font-medium text-destructive">{errors.postalCode}</p>
            )}
          </div>

          {/* Country */}
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Country <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="United States"
              name="country"
              value={formData.country}
              onChange={handleChange}
            />
            {errors.country && (
              <p className="text-sm font-medium text-destructive">{errors.country}</p>
            )}
          </div>

          {/* Is Primary Contact */}
          <div className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
            <Input
              type="checkbox"
              name="isPrimary"
              checked={formData.isPrimary}
              onChange={handleChange}
            />
            <div className="space-y-1 leading-none">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Set as primary contact
              </label>
              <p className="text-sm text-muted-foreground">
                This contact will be used as the main point of contact
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setFormData({
              contactPerson: '',
              email: '',
              phone: '',
              companyName: '',
              website: '',
              address: '',
              city: '',
              state: '',
              postalCode: '',
              country: '',
              isPrimary: false,
              department: '',
              designation: ''
            })}
            disabled={isLoading}
          >
            Reset
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Contact'}
          </Button>
        </div>
      </form>
    </div>
  );
}