"use client";

import { useState, useEffect } from "react";
import { api } from "../../api/route";
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

  useEffect(() => {
    fetchBannerData();
  }, []);

  const fetchBannerData = async () => {
    try {
      setIsLoading(true);
      const data = await api.get<BannerData>("/about99/banner");
      setBannerData(data);
    } catch (error) {
      console.error("Error fetching banner data:", error);
      toast.error("Failed to load banner data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await api.put("/about99/banner", bannerData);
      toast.success("Banner updated successfully!");
    } catch (error) {
      console.error("Error updating banner:", error);
      toast.error("Failed to update banner");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBannerData(prev => ({
      ...prev,
      [name]: value
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
        <div className="flex items-center space-x-2">
          <Switch
            id="banner-toggle"
            checked={bannerData.isActive}
            onChange={handleToggle}
          />
          <Label htmlFor="banner-toggle">
            {bannerData.isActive ? "Banner is Active" : "Banner is Inactive"}
          </Label>
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