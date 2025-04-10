import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoginForm } from "@/components/auth/login-form";
import { RegisterForm } from "@/components/auth/register-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { SiteSettings } from "@shared/schema";

export default function LoginPage() {
  const [_, navigate] = useLocation();
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("login");
  
  // Get site settings
  const { data: siteSettings } = useQuery<SiteSettings>({
    queryKey: ["/api/site-settings"],
  });

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
    <div className="container mx-auto py-8 px-4">
      <div className="grid md:grid-cols-2 gap-8 items-center max-w-6xl mx-auto">
        {/* Form section */}
        <div>
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold">
                {siteSettings?.siteName ? `Welcome to ${siteSettings.siteName}` : "Welcome to vApps by Vheüel"}
              </CardTitle>
              <CardDescription>
                Sign in to your account or create a new one to start contributing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs 
                defaultValue="login" 
                value={activeTab} 
                onValueChange={setActiveTab} 
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>
                <TabsContent value="login">
                  <LoginForm />
                </TabsContent>
                <TabsContent value="register">
                  <RegisterForm />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Hero section */}
        <div className="order-first md:order-last">
          <div className="text-center md:text-left space-y-6">
            <h1 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
              Join the Web3 Community
            </h1>
            <p className="text-muted-foreground text-xl font-light leading-relaxed">
              The ultimate Web3 project discovery platform, connecting blockchain innovators worldwide.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="bg-primary/10 p-2 rounded-full mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                </div>
                <p className="text-muted-foreground text-lg">Discover new Web3 projects across diverse ecosystems.</p>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-primary/10 p-2 rounded-full mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                </div>
                <p className="text-muted-foreground text-lg">Submit your own projects and share them with the community.</p>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-primary/10 p-2 rounded-full mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                </div>
                <p className="text-muted-foreground text-lg">Track and manage all your submissions in one place.</p>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-primary/10 p-2 rounded-full mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                </div>
                <p className="text-muted-foreground text-lg">Connect with the broader Web3 ecosystem and expand your network.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}