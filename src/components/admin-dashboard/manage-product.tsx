"use client";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { api } from "../../api/route";
import { toast } from "react-toastify";

interface Product {
  _id: string;
  id?: string; // Add optional id field for API compatibility
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  stock: number;
  category: string;
  imageurl: string;
  createdAt: string;
  updatedAt: string;
}

export function ManageProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get<{ success: boolean; data: Product[] }>('/product');
      console.log('Fetched products:', response); // Debug log
      if (response.success && Array.isArray(response.data)) {
        // Filter out any products without an ID and ensure _id is always defined
        const validProducts = response.data
          .filter(product => product._id || product.id) // Only include products with an ID
          .map(product => ({
            ...product,
            _id: (product._id || product.id) as string // We know at least one is defined due to the filter
          }));
        console.log('Processed products:', validProducts); // Debug log
        setProducts(validProducts);
      } else {
        console.error('Unexpected API response format:', response);
        toast.error('Failed to load products: Invalid response format');
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (productId: string | undefined) => {
    if (!productId) {
      console.error('Product ID is undefined');
      toast.error('Cannot delete product: Invalid product ID');
      return;
    }
    
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      setDeleteLoading(productId);
      console.log('Deleting product with ID:', productId);
      const response = await api.delete(`/product/${productId}`);
      console.log('Delete response:', response);
      toast.success('Product deleted successfully');
      fetchProducts(); // Refresh the list
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product. Please try again.');
    } finally {
      setDeleteLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Products</h1>
        <Button onClick={() => window.location.href = '/admin/add-product'}>
          Add New Product
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {products.length === 0 ? (
          <div className="col-span-full text-center py-10">
            <p className="text-muted-foreground">No products found. Add your first product!</p>
          </div>
        ) : (
          products.map((product) => (
            <Card key={product._id || Math.random().toString(36).substr(2, 9)} className="overflow-hidden">
              <CardHeader className="p-4">
                <div className="aspect-video bg-muted mb-4 rounded-md overflow-hidden">
                  {product.imageurl && product.imageurl.length > 0 ? (
                    <img
                      src={product.imageurl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <span className="text-muted-foreground">No Image</span>
                    </div>
                  )}
                </div>
                <CardTitle className="text-lg">{product.name}</CardTitle>
                <div className="text-sm text-muted-foreground">
                  {product.category}
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {product.description}
                </p>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-lg font-semibold">${product.salePrice?.toFixed(2)}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      • {product.stock} in stock
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/admin/products/edit/${product._id}`)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(product._id)}
                      disabled={deleteLoading === product._id}
                    >
                      {deleteLoading === product._id ? 'Deleting...' : 'Delete'}
                    </Button>
                  </div>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  Last updated: {formatDate(product.updatedAt)}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

export default ManageProducts;