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
import { Search, GlobeIcon, User, Menu, X, MoonIcon, SunIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

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
    <header className="sticky top-0 z-50 w-full border-b border-border/10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2">
            <div className="text-blue-500">
              <svg viewBox="0 0 30 30" width="30" height="30" fill="currentColor">
                <circle cx="15" cy="15" r="15" />
              </svg>
            </div>
            <span className="text-lg font-semibold">EARN App</span>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="hidden md:flex relative mx-4 flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <Input
            type="search"
            placeholder="Search"
            className="pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border-0"
          />
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-6 items-center">
          <Link href="/">
            <span className={`text-sm font-medium ${location === "/" ? "text-primary" : "text-muted-foreground"} hover:text-primary`}>
              Apps Catalog
            </span>
          </Link>
          <Link href="/journal">
            <div className="flex items-center space-x-1">
              <span className={`text-sm font-medium text-muted-foreground hover:text-primary`}>
                Journal
              </span>
              <div className="bg-blue-500 text-white text-[10px] px-1 rounded">NEW</div>
            </div>
          </Link>
        </nav>

        <div className="flex items-center space-x-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative">
                  <span>{user.username}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
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
              variant="default"
              size="sm"
              onClick={handleAuthClick}
              className="rounded-full px-4 bg-blue-500 hover:bg-blue-600 text-white"
            >
              Log In
            </Button>
          )}

          {/* Language Selector */}

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
          <div className="mb-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                type="search"
                placeholder="Search"
                className="pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border-0 w-full"
              />
            </div>
          </div>
          <nav className="flex flex-col space-y-4">
            <Link href="/" onClick={() => setMobileMenuOpen(false)}>
              <span className={`font-medium ${location === "/" ? "text-primary" : "text-foreground"}`}>
                Apps Catalog
              </span>
            </Link>
            <Link href="/journal" onClick={() => setMobileMenuOpen(false)}>
              <div className="flex items-center space-x-1">
                <span className={`font-medium text-foreground`}>
                  Journal
                </span>
                <div className="bg-blue-500 text-white text-[10px] px-1 rounded">NEW</div>
              </div>
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
                variant="default"
                onClick={() => {
                  setIsLoginModalOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white"
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
              <LoginForm onLoginSuccess={() => setIsLoginModalOpen(false)} />
            </TabsContent>
            <TabsContent value="register">
              <RegisterForm onRegisterSuccess={() => setIsLoginModalOpen(false)} />
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