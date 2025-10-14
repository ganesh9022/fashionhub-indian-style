import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  discount?: number;
  image: string;
  category: string;
}

export const ProductCard = ({ id, name, price, discount, image, category }: ProductCardProps) => {
  const navigate = useNavigate();
  
  const discountedPrice = discount ? price * (1 - discount / 100) : price;
  const hasDiscount = discount && discount > 0;

  return (
    <Card 
      className="group overflow-hidden cursor-pointer hover:shadow-[var(--product-hover)] transition-all duration-300"
      onClick={() => navigate(`/product/${id}`)}
    >
      <div className="relative overflow-hidden aspect-[3/4]">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {hasDiscount && (
          <Badge className="absolute top-4 right-4 bg-destructive text-destructive-foreground">
            -{discount}%
          </Badge>
        )}
        <Button
          size="icon"
          variant="secondary"
          className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            // Wishlist functionality
          }}
        >
          <Heart className="h-4 w-4" />
        </Button>
      </div>
      
      <CardContent className="pt-4">
        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
          {category}
        </p>
        <h3 className="font-semibold text-base mb-2 line-clamp-1">
          {name}
        </h3>
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg">
            ₹{discountedPrice.toFixed(2)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-muted-foreground line-through">
              ₹{price.toFixed(2)}
            </span>
          )}
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/product/${id}`);
          }}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
};
