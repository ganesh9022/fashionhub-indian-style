import { useUser, useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Package, ShoppingCart, TrendingUp, Users } from "lucide-react";

const Profile = () => {
  const { user } = useUser();
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [analytics, setAnalytics] = useState({
    totalSales: 0,
    totalOrders: 0,
    salesByCategory: [],
    recentOrders: []
  });

  useEffect(() => {
    if (!isSignedIn) {
      navigate('/auth');
      return;
    }

    checkAdminStatus();
    fetchAnalytics();
  }, [isSignedIn, user]);

  const checkAdminStatus = async () => {
    if (!user) return;
    
    // Check if user has admin role in Clerk
    const hasAdminRole = user.organizationMemberships?.some(
      membership => membership.role === 'admin'
    ) || user.publicMetadata?.role === 'admin';
    
    setIsAdmin(hasAdminRole);
  };

  const fetchAnalytics = async () => {
    if (!user) return;

    // Fetch sales analytics
    const { data: orders } = await supabase
      .from('orders')
      .select('*');

    const { data: orderItems } = await supabase
      .from('order_items')
      .select('*');

    const totalSales = orders?.reduce((sum, order) => sum + parseFloat(order.total_amount.toString()), 0) || 0;
    const totalOrders = orders?.length || 0;

    // Group sales by category
    const categoryStats = orderItems?.reduce((acc: any, item) => {
      const category = item.product_category;
      if (!acc[category]) {
        acc[category] = { name: category, value: 0, sales: 0 };
      }
      acc[category].value += item.quantity;
      acc[category].sales += parseFloat(item.price.toString()) * item.quantity;
      return acc;
    }, {});

    const salesByCategory = Object.values(categoryStats || {});

    setAnalytics({
      totalSales,
      totalOrders,
      salesByCategory,
      recentOrders: orders?.slice(0, 5) || []
    });
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">
            {isAdmin ? 'Admin Dashboard' : 'Profile'}
          </h1>

          {/* User Info Card */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <img
                  src={user.imageUrl}
                  alt="Profile"
                  className="w-16 h-16 rounded-full"
                />
                <div>
                  <h3 className="text-xl font-semibold">{user.fullName}</h3>
                  <p className="text-muted-foreground">{user.primaryEmailAddress?.emailAddress}</p>
                  <div className="flex gap-2 mt-2">
                    {isAdmin && <Badge variant="secondary">Admin</Badge>}
                    <Badge variant="outline">User</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Admin Analytics */}
          {isAdmin && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">₹{analytics.totalSales.toLocaleString()}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.totalOrders}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Categories</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.salesByCategory.length}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ₹{analytics.totalOrders > 0 ? Math.round(analytics.totalSales / analytics.totalOrders) : 0}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Sales by Category</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={analytics.salesByCategory}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`₹${value}`, 'Sales']} />
                        <Bar dataKey="sales" fill="hsl(var(--primary))" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Units Sold by Category</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={analytics.salesByCategory}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {analytics.salesByCategory.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;