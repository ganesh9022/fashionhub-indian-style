import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Package, TrendingUp } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Admin = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalProducts: 0, activeProducts: 0 });

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate('/auth');
      return;
    }

    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (!data) {
      toast.error('Access denied. Admin privileges required.');
      navigate('/');
      return;
    }

    setIsAdmin(true);
    fetchProducts();
    fetchStats();
    setLoading(false);
  };

  const fetchProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setProducts(data);
  };

  const fetchStats = async () => {
    const { count: total } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    const { count: active } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    setStats({
      totalProducts: total || 0,
      activeProducts: active || 0,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const product = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      category: formData.get('category') as any,
      price: parseFloat(formData.get('price') as string),
      discount_percentage: parseInt(formData.get('discount') as string) || 0,
      stock_quantity: parseInt(formData.get('stock') as string),
      available_sizes: ['S', 'M', 'L', 'XL'] as any,
      available_colors: (formData.get('colors') as string).split(',').map(c => c.trim()),
      image_url: formData.get('image_url') as string,
      is_active: true,
    };

    const { error } = await supabase.from('products').insert([product]);

    if (error) {
      toast.error('Failed to add product');
    } else {
      toast.success('Product added successfully!');
      e.currentTarget.reset();
      fetchProducts();
      fetchStats();
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 flex-1">
        <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Products</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeProducts}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="add">
          <TabsList>
            <TabsTrigger value="add">Add Product</TabsTrigger>
            <TabsTrigger value="manage">Manage Products</TabsTrigger>
          </TabsList>

          <TabsContent value="add">
            <Card>
              <CardHeader>
                <CardTitle>Add New Product</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Product Name</Label>
                      <Input id="name" name="name" required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select name="category" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="men">Men</SelectItem>
                          <SelectItem value="women">Women</SelectItem>
                          <SelectItem value="kids">Kids</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="price">Price (₹)</Label>
                      <Input id="price" name="price" type="number" step="0.01" required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="discount">Discount (%)</Label>
                      <Input id="discount" name="discount" type="number" min="0" max="100" defaultValue="0" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="stock">Stock Quantity</Label>
                      <Input id="stock" name="stock" type="number" required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="colors">Colors (comma-separated)</Label>
                      <Input id="colors" name="colors" placeholder="Black, White, Blue" required />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="image_url">Image URL</Label>
                      <Input id="image_url" name="image_url" type="url" required />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea id="description" name="description" rows={4} />
                    </div>
                  </div>

                  <Button type="submit" className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Product
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manage">
            <Card>
              <CardHeader>
                <CardTitle>All Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {products.map((product) => (
                    <div key={product.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <img
                        src={product.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30'}
                        alt={product.name}
                        className="w-20 h-20 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {product.category} | ₹{product.price} | Stock: {product.stock_quantity}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">Edit</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
