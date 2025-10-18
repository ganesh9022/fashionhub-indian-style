import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser, useAuth } from "@clerk/clerk-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Minus, Plus, ShoppingCart, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const { isSignedIn } = useAuth();
  const [product, setProduct] = useState<any>(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      
      if (data) {
        setProduct(data);
        setSelectedSize(data.available_sizes?.[0] || '');
        setSelectedColor(data.available_colors?.[0] || '');
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!isSignedIn) {
      toast.error('Please sign in to add items to cart');
      navigate('/auth');
      return;
    }

    if (!selectedSize || !selectedColor) {
      toast.error('Please select size and color');
      return;
    }

    try {
      const { error } = await supabase
        .from('cart_items')
        .upsert([{
          user_id: user.id,
          product_id: product.id,
          quantity,
          selected_size: selectedSize as any,
          selected_color: selectedColor,
        }], {
          onConflict: 'user_id,product_id,selected_size,selected_color'
        });

      if (error) throw error;

      toast.success('Added to cart!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to add to cart');
    }
  };

  if (!product) {
    return <div>Loading...</div>;
  }

  const discountedPrice = product.discount_percentage
    ? product.price * (1 - product.discount_percentage / 100)
    : product.price;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="aspect-[3/4] rounded-lg overflow-hidden">
              <img
                src={product.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <Badge className="mb-2">{product.category}</Badge>
              <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl font-bold">₹{discountedPrice.toFixed(2)}</span>
                {product.discount_percentage > 0 && (
                  <>
                    <span className="text-xl text-muted-foreground line-through">
                      ₹{product.price.toFixed(2)}
                    </span>
                    <Badge variant="destructive">-{product.discount_percentage}%</Badge>
                  </>
                )}
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {product.description || 'No description available'}
              </p>
            </div>

            {/* Size Selection */}
            <div>
              <Label className="text-base font-semibold mb-3 block">Select Size</Label>
              <RadioGroup value={selectedSize} onValueChange={setSelectedSize}>
                <div className="flex gap-3">
                  {product.available_sizes?.map((size: string) => (
                    <div key={size}>
                      <RadioGroupItem value={size} id={`size-${size}`} className="peer sr-only" />
                      <Label
                        htmlFor={`size-${size}`}
                        className="flex items-center justify-center w-12 h-12 rounded-md border-2 border-muted peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer hover:border-primary/50 transition-colors"
                      >
                        {size}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>

            {/* Color Selection */}
            <div>
              <Label className="text-base font-semibold mb-3 block">Select Color</Label>
              <RadioGroup value={selectedColor} onValueChange={setSelectedColor}>
                <div className="flex gap-3">
                  {product.available_colors?.map((color: string) => (
                    <div key={color}>
                      <RadioGroupItem value={color} id={`color-${color}`} className="peer sr-only" />
                      <Label
                        htmlFor={`color-${color}`}
                        className="flex items-center justify-center px-6 h-12 rounded-md border-2 border-muted peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer hover:border-primary/50 transition-colors"
                      >
                        {color}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>

            {/* Quantity */}
            <div>
              <Label className="text-base font-semibold mb-3 block">Quantity</Label>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-lg font-semibold w-12 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <Button 
                size="lg" 
                className="flex-1"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
              <Button size="lg" variant="outline">
                <Heart className="h-5 w-5" />
              </Button>
            </div>

            {/* Stock Status */}
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                {product.stock_quantity > 0 ? (
                  <span className="text-green-600 font-medium">In Stock ({product.stock_quantity} available)</span>
                ) : (
                  <span className="text-destructive font-medium">Out of Stock</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetail;
