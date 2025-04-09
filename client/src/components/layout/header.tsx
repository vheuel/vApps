import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoginForm } from "@/components/auth/login-form";
import { RegisterForm } from "@/components/auth/register-form";
import { User, LockIcon, Menu, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [activeAuthTab, setActiveAuthTab] = useState("login");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleAuthClick = () => {
    if (user) {
      // If user is logged in, don't show login modal
      return;
    }
    setIsLoginModalOpen(true);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gray-200 rounded-md flex items-center justify-center">
              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            </div>
            <span className="text-xl font-bold">EARN App</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-6 items-center">
          <Link href="/">
            <span className={`text-sm font-medium ${location === "/" ? "text-primary" : "text-muted-foreground"} hover:text-primary`}>
              Home
            </span>
          </Link>
          <Link href="/category/airdrop">
            <span className={`text-sm font-medium ${location.startsWith("/category") ? "text-primary" : "text-muted-foreground"} hover:text-primary`}>
              Categories
            </span>
          </Link>
          {user && (
            <Link href="/submit">
              <span className={`text-sm font-medium ${location === "/submit" ? "text-primary" : "text-muted-foreground"} hover:text-primary`}>
                Submit Project
              </span>
            </Link>
          )}
          {user?.isAdmin && (
            <Link href="/admin">
              <span className={`text-sm font-medium ${location === "/admin" ? "text-primary" : "text-muted-foreground"} hover:text-primary`}>
                Admin
              </span>
            </Link>
          )}
        </nav>

        <div className="flex items-center space-x-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user.username}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/submit">Submit Project</Link>
                </DropdownMenuItem>
                {user.isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin">Admin Dashboard</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleAuthClick}
              aria-label="Login"
            >
              <LockIcon className="h-5 w-5" />
            </Button>
          )}

          <ModeToggle />

          {/* Mobile menu button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-background p-4 border-b">
          <nav className="flex flex-col space-y-4">
            <Link href="/" onClick={() => setMobileMenuOpen(false)}>
              <span className={`font-medium ${location === "/" ? "text-primary" : "text-foreground"}`}>
                Home
              </span>
            </Link>
            <Link href="/category/airdrop" onClick={() => setMobileMenuOpen(false)}>
              <span className={`font-medium ${location.startsWith("/category") ? "text-primary" : "text-foreground"}`}>
                Categories
              </span>
            </Link>
            {user && (
              <>
                <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>
                  <span className={`font-medium ${location === "/profile" ? "text-primary" : "text-foreground"}`}>
                    Profile
                  </span>
                </Link>
                <Link href="/submit" onClick={() => setMobileMenuOpen(false)}>
                  <span className={`font-medium ${location === "/submit" ? "text-primary" : "text-foreground"}`}>
                    Submit Project
                  </span>
                </Link>
                {user.isAdmin && (
                  <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                    <span className={`font-medium ${location === "/admin" ? "text-primary" : "text-foreground"}`}>
                      Admin Dashboard
                    </span>
                  </Link>
                )}
                <Button
                  variant="outline"
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                >
                  Logout
                </Button>
              </>
            )}
            {!user && (
              <Button
                variant="outline"
                onClick={() => {
                  setIsLoginModalOpen(true);
                  setMobileMenuOpen(false);
                }}
              >
                Login / Register
              </Button>
            )}
          </nav>
        </div>
      )}

      {/* Login/Register Modal */}
      <Dialog open={isLoginModalOpen} onOpenChange={setIsLoginModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold">
              {activeAuthTab === "login" ? "Login" : "Register"}
            </DialogTitle>
          </DialogHeader>
          <Tabs
            defaultValue="login"
            value={activeAuthTab}
            onValueChange={setActiveAuthTab}
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
          <div className="text-center text-sm text-muted-foreground pt-4 border-t">
            © 2025 EARN App. All rights reserved.
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}
