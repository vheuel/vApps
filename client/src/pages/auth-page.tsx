import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { LoginForm } from "@/components/auth/login-form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function AuthPage() {
  const [_, navigate] = useLocation();
  const { user, isLoading } = useAuth();

  // Redirect to home if already logged in
  useEffect(() => {
    if (user && !isLoading) {
      navigate("/");
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="grid md:grid-cols-2 gap-8 items-center max-w-6xl mx-auto">
        {/* Login form section */}
        <div>
          <Card className="shadow-lg border-primary/10">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold">Login to vApps</CardTitle>
              <CardDescription>
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LoginForm />
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 border-t pt-6">
              <div className="text-sm text-center">
                Don't have an account?{" "}
                <Link href="/register" className="text-primary font-medium hover:underline">
                  Create an account
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* Hero section */}
        <div className="order-first md:order-last">
          <div className="text-center md:text-left space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold">
              Welcome to vApps by Vheüel
            </h1>
            <p className="text-muted-foreground text-lg">
              vApps is a community-driven platform for discovering and sharing the best Web3 applications, wallets, exchanges, and more.
            </p>
            <ul className="space-y-3 md:list-disc md:pl-5">
              <li className="text-muted-foreground">Discover new Web3 projects across all categories</li>
              <li className="text-muted-foreground">Submit your own projects to the community</li>
              <li className="text-muted-foreground">Keep track of all your submissions</li>
              <li className="text-muted-foreground">Connect with the broader Web3 ecosystem</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
