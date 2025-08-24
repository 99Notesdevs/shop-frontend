"use client";

import { X } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { env } from '../config/env';

export function AuthModal() {
  const { isUserModalOpen, userModalType, closeUserModal } = useUser();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(userModalType || 'login');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });

  useEffect(() => {
    if (userModalType) {
      setActiveTab(userModalType);
    }
  }, [userModalType]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent, type: 'login' | 'register') => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if(type === 'login') {
        const response = await fetch(`${env.API_AUTH}/user`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(formData),
        });
        const responseData = await response.json() as { success: boolean };
        console.log(responseData);
        if (!responseData.success) throw new Error('Failed to login');
      }
      
      if(type === 'register') {
        const response = await fetch(`${env.API_AUTH}/user/signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(formData),
        });
        const responseData = await response.json() as { success: boolean };
        console.log(responseData);
        if (!responseData.success) throw new Error('Failed to register');
      }
      
      closeUserModal();
    } catch (error) {
      console.error(`${type} error:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isUserModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg w-[90%] max-w-[425px] p-6 relative">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {activeTab === 'login' ? 'Welcome back!' : 'Create an account'}
          </h2>
          <Button
            variant="outline"
            onClick={closeUserModal}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>

        <div className="flex mb-6 border-b">
          <button
            className={`flex-1 py-2 px-4 font-medium ${activeTab === 'login' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}
            onClick={() => setActiveTab('login')}
          >
            Login
          </button>
          <button
            className={`flex-1 py-2 px-4 font-medium ${activeTab === 'register' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}
            onClick={() => setActiveTab('register')}
          >
            Register
          </button>
        </div>

        {activeTab === 'login' ? (
          <form onSubmit={(e) => handleSubmit(e, 'login')} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                name="email"
                type="email"
                placeholder="your@email.com"
                required
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="login-password">Password</Label>
                <button
                  type="button"
                  className="text-sm text-primary hover:underline"
                  onClick={() => {}}
                >
                  Forgot password?
                </button>
              </div>
              <Input
                id="login-password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        ) : (
          <form onSubmit={(e) => handleSubmit(e, 'register')} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="register-firstName">First Name</Label>
              <Input
                id="register-firstName"
                name="firstName"
                placeholder="John"
                required
                value={formData.firstName}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="register-lastName">Last Name</Label>
              <Input
                id="register-lastName"
                name="lastName"
                placeholder="Doe"
                required
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="register-email">Email</Label>
              <Input
                id="register-email"
                name="email"
                type="email"
                placeholder="your@email.com"
                required
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="register-password">Password</Label>
              <Input
                id="register-password"
                name="password"
                type="password"
                required
                minLength={6}
                value={formData.password}
                onChange={handleChange}
              />
              <p className="text-xs text-muted-foreground">
                Password must be at least 6 characters long
              </p>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating account...' : 'Create account'}
            </Button>
          </form>
        )}

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-gray-900 px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" type="button" disabled={isLoading}>
            Google
          </Button>
          <Button variant="outline" type="button" disabled={isLoading}>
            GitHub
          </Button>
        </div>
      </div>
    </div>
  );
}

export default AuthModal;
