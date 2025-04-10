import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  BarChart3,
  Settings,
  UserCog,
  Archive,
  Clock,
  Tag,
  LayoutDashboard,
  ChevronRight,
  Menu,
  X,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
}

interface SidebarItemProps {
  icon: ReactNode;
  label: string;
  href: string;
  active?: boolean;
  isPro?: boolean;
}

export function DashboardLayout({ children, title, description }: DashboardLayoutProps) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  if (!user?.isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <h1 className="text-2xl font-bold mb-2">Access Restricted</h1>
        <p className="text-muted-foreground mb-6">You do not have permission to view this page.</p>
        <Button asChild>
          <Link href="/">Return to Home</Link>
        </Button>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex min-h-screen bg-muted/20">
      {/* Sidebar for desktop */}
      <aside className="hidden lg:flex w-64 flex-col border-r bg-background">
        <div className="flex flex-col px-6 py-5 min-h-screen">
          <Link href="/admin" className="flex items-center gap-2 mb-6">
            <div className="bg-primary h-8 w-8 rounded-md flex items-center justify-center text-white font-semibold text-lg">
              A
            </div>
            <h2 className="text-xl font-semibold tracking-tight">Admin Panel</h2>
          </Link>

          <nav className="flex-1 space-y-1 mt-2">
            <p className="text-xs font-medium text-muted-foreground px-2 py-2">
              DASHBOARD
            </p>
            <SidebarItem
              icon={<LayoutDashboard className="h-5 w-5" />}
              label="Overview"
              href="/admin"
              active={location === "/admin"}
            />
            <SidebarItem
              icon={<Clock className="h-5 w-5" />}
              label="Pending Projects"
              href="/admin?tab=pending"
              active={location === "/admin" && window.location.search.includes("tab=pending")}
            />
            <SidebarItem
              icon={<Archive className="h-5 w-5" />}
              label="Approved Projects"
              href="/admin?tab=approved"
              active={location === "/admin" && window.location.search.includes("tab=approved")}
            />

            <p className="text-xs font-medium text-muted-foreground px-2 py-2 mt-6">
              MANAGEMENT
            </p>
            <SidebarItem
              icon={<UserCog className="h-5 w-5" />}
              label="Users"
              href="/admin?tab=users"
              active={location === "/admin" && window.location.search.includes("tab=users")}
            />
            <SidebarItem
              icon={<Tag className="h-5 w-5" />}
              label="Categories"
              href="/admin?tab=categories"
              active={location === "/admin" && window.location.search.includes("tab=categories")}
            />
            <SidebarItem
              icon={<BarChart3 className="h-5 w-5" />}
              label="Analytics"
              href="/admin?tab=stats"
              active={location === "/admin" && window.location.search.includes("tab=stats")}
            />
            <SidebarItem
              icon={<Settings className="h-5 w-5" />}
              label="Site Settings"
              href="/admin?tab=settings"
              active={location === "/admin" && window.location.search.includes("tab=settings")}
            />
          </nav>

          <div className="mt-auto pt-4">
            <Separator className="mb-4" />
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-2 text-primary font-medium">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium">{user.username}</p>
                  <p className="text-xs text-muted-foreground">Admin</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile nav */}
      <div className="lg:hidden sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background px-4">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="bg-primary h-8 w-8 rounded-md flex items-center justify-center text-white font-semibold text-lg">
            A
          </div>
          <h2 className="text-xl font-semibold tracking-tight">Admin</h2>
        </Link>

        <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="h-8 w-8">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="flex flex-col px-6 py-5 h-full">
              <div className="flex items-center justify-between mb-6">
                <Link 
                  href="/admin" 
                  className="flex items-center gap-2"
                  onClick={() => setIsMobileNavOpen(false)}
                >
                  <div className="bg-primary h-8 w-8 rounded-md flex items-center justify-center text-white font-semibold text-lg">
                    A
                  </div>
                  <h2 className="text-xl font-semibold tracking-tight">Admin Panel</h2>
                </Link>
                <Button variant="ghost" size="icon" onClick={() => setIsMobileNavOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <ScrollArea className="flex-1 my-4">
                <nav className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground px-2 py-2">
                    DASHBOARD
                  </p>
                  <MobileSidebarItem
                    icon={<LayoutDashboard className="h-5 w-5" />}
                    label="Overview"
                    href="/admin"
                    active={location === "/admin" && !window.location.search}
                    onClick={() => setIsMobileNavOpen(false)}
                  />
                  <MobileSidebarItem
                    icon={<Clock className="h-5 w-5" />}
                    label="Pending Projects"
                    href="/admin?tab=pending"
                    active={location === "/admin" && window.location.search.includes("tab=pending")}
                    onClick={() => setIsMobileNavOpen(false)}
                  />
                  <MobileSidebarItem
                    icon={<Archive className="h-5 w-5" />}
                    label="Approved Projects"
                    href="/admin?tab=approved"
                    active={location === "/admin" && window.location.search.includes("tab=approved")}
                    onClick={() => setIsMobileNavOpen(false)}
                  />

                  <p className="text-xs font-medium text-muted-foreground px-2 py-2 mt-6">
                    MANAGEMENT
                  </p>
                  <MobileSidebarItem
                    icon={<UserCog className="h-5 w-5" />}
                    label="Users"
                    href="/admin?tab=users"
                    active={location === "/admin" && window.location.search.includes("tab=users")}
                    onClick={() => setIsMobileNavOpen(false)}
                  />
                  <MobileSidebarItem
                    icon={<Tag className="h-5 w-5" />}
                    label="Categories"
                    href="/admin?tab=categories"
                    active={location === "/admin" && window.location.search.includes("tab=categories")}
                    onClick={() => setIsMobileNavOpen(false)}
                  />
                  <MobileSidebarItem
                    icon={<BarChart3 className="h-5 w-5" />}
                    label="Analytics"
                    href="/admin?tab=stats"
                    active={location === "/admin" && window.location.search.includes("tab=stats")}
                    onClick={() => setIsMobileNavOpen(false)}
                  />
                  <MobileSidebarItem
                    icon={<Settings className="h-5 w-5" />}
                    label="Site Settings"
                    href="/admin?tab=settings"
                    active={location === "/admin" && window.location.search.includes("tab=settings")}
                    onClick={() => setIsMobileNavOpen(false)}
                  />
                </nav>
              </ScrollArea>

              <div className="mt-auto pt-4">
                <Separator className="mb-4" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-2 text-primary font-medium">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{user.username}</p>
                      <p className="text-xs text-muted-foreground">Admin</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Main content */}
      <main className="flex-1">
        <div className="flex flex-col min-h-screen">
          <div className="flex-1 space-y-4 p-4 md:p-8">
            <div className="space-y-1">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h1>
              {description && <p className="text-muted-foreground">{description}</p>}
            </div>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

function SidebarItem({ icon, label, href, active, isPro }: SidebarItemProps) {
  return (
    <Link href={href}>
      <div
        className={cn(
          "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors",
          active ? "bg-accent text-accent-foreground" : "transparent"
        )}
      >
        <div className={cn("mr-2 text-muted-foreground group-hover:text-foreground", active && "text-foreground")}>
          {icon}
        </div>
        <span>{label}</span>
        {isPro && <div className="ml-auto text-xs bg-primary text-primary-foreground rounded px-1">PRO</div>}
      </div>
    </Link>
  );
}

interface MobileSidebarItemProps extends SidebarItemProps {
  onClick?: () => void;
}

function MobileSidebarItem({ icon, label, href, active, isPro, onClick }: MobileSidebarItemProps) {
  return (
    <Link href={href} onClick={onClick}>
      <div
        className={cn(
          "flex items-center rounded-md px-3 py-2 text-sm font-medium",
          active ? "bg-accent text-accent-foreground" : "hover:bg-accent hover:text-accent-foreground"
        )}
      >
        <div className={cn("mr-2", active ? "text-foreground" : "text-muted-foreground")}>
          {icon}
        </div>
        <span>{label}</span>
        {isPro && <div className="ml-auto text-xs bg-primary text-primary-foreground rounded px-1">PRO</div>}
        <ChevronRight className="ml-auto h-4 w-4 opacity-70" />
      </div>
    </Link>
  );
}