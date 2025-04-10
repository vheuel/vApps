import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { RegisterForm } from "@/components/auth/register-form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function RegisterPage() {
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
        {/* Registration form section */}
        <div>
          <Card className="shadow-lg border-primary/10">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold">Create an Account</CardTitle>
              <CardDescription>
                Join vApps by Vheüel and start contributing to the Web3 community
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RegisterForm />
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 border-t pt-6">
              <div className="text-sm text-center">
                Already have an account?{" "}
                <Link href="/login" className="text-primary font-medium hover:underline">
                  Log in
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* Hero section */}
        <div className="order-first md:order-last">
          <div className="text-center md:text-left space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold">
              Join the vApps Community
            </h1>
            <p className="text-muted-foreground text-lg">
              Creating an account gives you access to all features of vApps, the premier platform for Web3 discovery and sharing.
            </p>
            <ul className="space-y-3 md:list-disc md:pl-5">
              <li className="text-muted-foreground">Submit your own Web3 projects</li>
              <li className="text-muted-foreground">Engage with the community through comments and likes</li>
              <li className="text-muted-foreground">Create and share posts about your experiences</li>
              <li className="text-muted-foreground">Build your profile and showcase your contributions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}