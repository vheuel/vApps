import { useQuery } from "@tanstack/react-query";
import { Project, User, Category } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { 
  UsersIcon, 
  FolderIcon, 
  Package2Icon, 
  Loader2, 
  ClockIcon, 
  CheckCircle,
  ShieldCheckIcon,
  TagIcon
} from "lucide-react";
import { BarChart, LineChart, DonutChart } from "../../components/ui/charts";

export function DashboardStats() {
  const { data: projects, isLoading: isProjectsLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: pendingProjects, isLoading: isPendingLoading } = useQuery<Project[]>({
    queryKey: ["/api/admin/projects/pending"],
  });

  const { data: users, isLoading: isUsersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  const { data: categories, isLoading: isCategoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const isLoading = isProjectsLoading || isPendingLoading || isUsersLoading || isCategoriesLoading;

  // Calculate statistics
  const totalProjects = projects?.length || 0;
  const approvedProjects = projects?.filter(p => p.approved).length || 0;
  const pendingCount = pendingProjects?.length || 0;
  const totalUsers = users?.length || 0;
  const verifiedUsers = users?.filter(u => u.verified).length || 0;
  const adminUsers = users?.filter(u => u.isAdmin).length || 0;
  const totalCategories = categories?.length || 0;

  // Get category data for charts
  const getCategoryData = () => {
    if (!projects || !categories) return [];
    
    const categoryCounts = categories.map(category => {
      const count = projects.filter(p => p.category === category.slug && p.approved).length;
      return {
        name: category.name,
        value: count,
      };
    });
    
    // Return only categories with projects
    return categoryCounts.filter(cat => cat.value > 0);
  };

  const categoryData = getCategoryData();

  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              title="Total Projects"
              value={totalProjects}
              description="Total user submissions"
              icon={<Package2Icon className="h-5 w-5" />}
              className="bg-blue-50 dark:bg-blue-950/30 text-blue-500"
            />
            <StatCard 
              title="Pending Projects"
              value={pendingCount}
              description="Awaiting approval"
              icon={<ClockIcon className="h-5 w-5" />}
              className="bg-amber-50 dark:bg-amber-950/30 text-amber-500"
            />
            <StatCard 
              title="Total Users"
              value={totalUsers}
              description={`${verifiedUsers} verified`}
              icon={<UsersIcon className="h-5 w-5" />}
              className="bg-green-50 dark:bg-green-950/30 text-green-500"
            />
            <StatCard 
              title="Categories"
              value={totalCategories}
              description="Project categories"
              icon={<FolderIcon className="h-5 w-5" />}
              className="bg-purple-50 dark:bg-purple-950/30 text-purple-500"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardContent className="pt-6">
                <h3 className="text-lg font-medium mb-4">Projects by Category</h3>
                <div className="h-72">
                  <BarChart 
                    data={categoryData}
                    index="name"
                    categories={["value"]}
                    valueFormatter={(value: number) => `${value} projects`}
                    colors={["#3b82f6"]}
                    showLegend={false}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-medium mb-4">User Statistics</h3>
                <div className="h-72 flex items-center justify-center">
                  <DonutChart 
                    data={[
                      { name: "Regular Users", value: totalUsers - verifiedUsers - adminUsers },
                      { name: "Verified Users", value: verifiedUsers },
                      { name: "Admins", value: adminUsers }
                    ]}
                    category="value"
                    index="name"
                    valueFormatter={(value: number) => `${value} users`}
                    colors={["#94a3b8", "#3b82f6", "#f59e0b"]}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-medium mb-4">Project Status</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex flex-col items-center p-4 bg-green-50 dark:bg-green-950/30 rounded-md">
                    <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
                    <span className="text-2xl font-bold">{approvedProjects}</span>
                    <span className="text-sm text-muted-foreground">Approved</span>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-amber-50 dark:bg-amber-950/30 rounded-md">
                    <ClockIcon className="h-8 w-8 text-amber-500 mb-2" />
                    <span className="text-2xl font-bold">{pendingCount}</span>
                    <span className="text-sm text-muted-foreground">Pending</span>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-blue-50 dark:bg-blue-950/30 rounded-md">
                    <ShieldCheckIcon className="h-8 w-8 text-blue-500 mb-2" />
                    <span className="text-2xl font-bold">{projects?.filter(p => p.verified).length || 0}</span>
                    <span className="text-sm text-muted-foreground">Verified</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
  className?: string;
}

function StatCard({ title, value, description, icon, className }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          </div>
          <div className={`p-2 rounded-full ${className}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}