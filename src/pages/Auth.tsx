import { SignIn, SignUp } from "@clerk/clerk-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-background to-secondary/20 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">
              {isSignUp ? "Create Account" : "Welcome Back"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isSignUp ? (
              <SignUp 
                appearance={{
                  elements: {
                    formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground",
                    card: "shadow-none",
                  }
                }}
                redirectUrl="/"
              />
            ) : (
              <SignIn 
                appearance={{
                  elements: {
                    formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground",
                    card: "shadow-none",
                  }
                }}
                redirectUrl="/"
              />
            )}
            
            <div className="mt-4 text-center">
              <Button
                variant="ghost"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm"
              >
                {isSignUp 
                  ? "Already have an account? Sign in" 
                  : "Don't have an account? Sign up"
                }
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
