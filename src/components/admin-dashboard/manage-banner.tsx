"use client";

import { useState, useEffect } from "react";
import { env } from "../../config/env";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import Switch from "react-switch";
import { toast } from "react-toastify";

interface BannerData {
  isActive: boolean;
  title: string;
  description: string;
  redirectLink: string;
}

export default function ManageBanner() {
  const [bannerData, setBannerData] = useState<BannerData>({
    isActive: false,
    title: "",
    description: "",
    redirectLink: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch banner data on component mount
  useEffect(() => {
    const fetchBannerData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${env.API_MAIN}/about-99-notes/banner`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        const responseData = await response.json();
        console.log("Banner data", responseData);
        
        if (response.status === 404 || !responseData.success) {
          // Banner doesn't exist yet, initialize with default values
          console.log("No banner found, initializing with default values");
          setBannerData({
            isActive: false,
            title: "",
            description: "",
            redirectLink: "",
          });
          return;
        }
        
        if (responseData.data) {
          try {
            // The banner data might be in the data object directly or in a content field
            const bannerContent = responseData.data.content 
              ? typeof responseData.data.content === 'string' 
                ? JSON.parse(responseData.data.content)
                : responseData.data.content
              : responseData.data;
            
            if (bannerContent) {
              setBannerData({
                isActive: bannerContent.isActive ?? false,
                title: bannerContent.title || "",
                description: bannerContent.description || "",
                redirectLink: bannerContent.redirectLink || "",
              });
            }
          } catch (error) {
            console.error("Error parsing banner content:", error);
            toast.error("Invalid banner data format");
          }
        }
      } catch (error) {
        console.error("Error fetching banner data:", error);
        toast.error("Failed to load banner data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBannerData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    
    try {
      setIsSaving(true);
      // First try to update the banner
      const response = await fetch(`${env.API_MAIN}/about-99-notes/3`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'banner',  // Must match the expected title in the backend
          content: JSON.stringify(bannerData),
          isActive: bannerData.isActive
        }),
      });
      
      let responseData;
      try {
        responseData = await response.json();
      } catch (e) {
        responseData = {};
      }
      
      // If update failed with 404, try to create a new banner
      if (response.status === 404) {
        const createResponse = await fetch(`${env.API_MAIN}/about-99-notes`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: 'banner',
            content: JSON.stringify(bannerData),
            isActive: bannerData.isActive
          }),
        });
        
        if (!createResponse.ok) {
          const errorData = await createResponse.json().catch(() => ({}));
          throw new Error(errorData.message || "Failed to create banner");
        }
        
        toast.success("Banner created successfully!");
        return;
      }
      
      if (!response.ok) {
        throw new Error(responseData.message || "Failed to update banner");
      }
      
      toast.success("Banner updated successfully!");
    } catch (error) {
      console.error("Error updating banner:", error);
      toast.error("Failed to update banner");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setBannerData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleToggle = (checked: boolean) => {
    setBannerData(prev => ({
      ...prev,
      isActive: checked
    }));
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Manage Hero Banner</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Switch
              id="banner-toggle"
              checked={bannerData.isActive}
              onChange={handleToggle}
              onColor="#2563eb"
              offColor="#9ca3af"
              height={24}
              width={48}
            />
            <Label htmlFor="banner-toggle">
              {bannerData.isActive ? "Banner is Active" : "Banner is Inactive"}
            </Label>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            name="title"
            value={bannerData.title}
            onChange={handleChange}
            placeholder="Enter banner title"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            value={bannerData.description}
            onChange={handleChange}
            placeholder="Enter banner description"
            rows={4}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="redirectLink">Redirect Link</Label>
          <Input
            id="redirectLink"
            name="redirectLink"
            type="url"
            value={bannerData.redirectLink}
            onChange={handleChange}
            placeholder="https://example.com"
            required
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}