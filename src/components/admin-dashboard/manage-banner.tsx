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
        const response = await env.API_MAIN.get("/about99/banner");
        if (response.data?.content) {
          const content = typeof response.data.content === 'string' 
            ? JSON.parse(response.data.content) 
            : response.data.content;
          setBannerData({
            isActive: content.isActive ?? false,
            title: content.title || "",
            description: content.description || "",
            redirectLink: content.redirectLink || "",
          });
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
      const response = await env.API_MAIN.put("/about-99-notes/banner", bannerData);
      
      if (response.data) {
        toast.success("Banner updated successfully!");
      }
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