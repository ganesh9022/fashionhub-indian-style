import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { ArrowRight, TrendingUp, Shield, Truck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .limit(8);
      
      if (data) setFeaturedProducts(data);
    };

    fetchFeaturedProducts();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-[var(--hero-gradient)]"
          style={{
            background: 'var(--hero-gradient)'
          }}
        />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1441984904996-e0b6ba687e04')] bg-cover bg-center opacity-20" />
        
        <div className="relative z-10 container mx-auto px-4 text-center text-primary-foreground">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            Elevate Your Style
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto text-primary-foreground/90 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-150">
            Discover the latest fashion trends for men, women, and kids
          </p>
          <div className="flex gap-4 justify-center animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
            <Button 
              size="lg" 
              className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-[var(--accent-glow)]"
              onClick={() => navigate('/products/all')}
            >
              Shop Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="bg-white/10 text-white border-white/20 hover:bg-white/20"
              onClick={() => navigate('/products/all')}
            >
              Explore Collections
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-4">
                <Truck className="h-8 w-8 text-accent" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Free Shipping</h3>
              <p className="text-muted-foreground">On orders over ₹1,999</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-4">
                <Shield className="h-8 w-8 text-accent" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Secure Payment</h3>
              <p className="text-muted-foreground">100% secure transactions</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-4">
                <TrendingUp className="h-8 w-8 text-accent" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Latest Trends</h3>
              <p className="text-muted-foreground">New arrivals every week</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Shop by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Men', image: 'https://images.unsplash.com/photo-1488161628813-04466f872be2', category: 'men' },
              { name: 'Women', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b', category: 'women' },
              { name: 'Kids', image: 'https://images.unsplash.com/photo-1514090458221-65bb69cf63e4', category: 'kids' }
            ].map((cat) => (
              <div 
                key={cat.category}
                className="relative h-96 rounded-lg overflow-hidden cursor-pointer group"
                onClick={() => navigate(`/products/${cat.category}`)}
              >
                <img 
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-8 left-8 text-white">
                  <h3 className="text-3xl font-bold mb-2">{cat.name}</h3>
                  <Button variant="secondary">
                    Shop Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Featured Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  discount={product.discount_percentage}
                  image={product.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30'}
                  category={product.category}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default Index;
