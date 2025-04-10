import { DashboardLayout } from "@/components/admin/dashboard-layout";
import { DashboardStats } from "@/components/admin/dashboard-stats";
import { ProjectsManagement } from "@/components/admin/projects-management";
import { UsersManagement } from "@/components/admin/users-management";
import { SiteSettingsForm } from "@/components/admin/site-settings-form";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Category, InsertCategory, SiteSettings } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Loader2, 
  PlusIcon, 
  PencilIcon, 
  Trash2Icon,
  LayoutDashboard,
  Clock,
  Archive,
  UserCog,
  BarChart3,
  Tag,
  Settings
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useLocation } from "wouter";

// Form schema for categories
const categoryFormSchema = z.object({
  name: z.string().min(2, { message: "Category name must be at least 2 characters" }),
  slug: z.string().min(2, { message: "Slug must be at least 2 characters" })
    .regex(/^[a-z0-9-]+$/, { message: "Slug can only contain lowercase letters, numbers, and hyphens" }),
  icon: z.string().optional(),
  description: z.string().optional(),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

export default function AdminPage() {
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  
  // Get tab from URL if present
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const tab = searchParams.get("tab");
    if (tab) {
      setActiveTab(tab);
    }
  }, [location]);

  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === "dashboard") {
      setLocation("/admin");
    } else {
      setLocation(`/admin?tab=${value}`);
    }
  };
  
  // Site settings query
  const { data: siteSettings, isLoading: isSettingsLoading, refetch: refetchSettings } = useQuery<SiteSettings>({
    queryKey: ["/api/site-settings"],
  });
  
  const { data: categories, isLoading: isCategoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });
  
  // Category CRUD mutations
  const createCategoryMutation = useMutation({
    mutationFn: async (category: CategoryFormValues) => {
      const res = await apiRequest("POST", "/api/admin/categories", category);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: "Category created",
        description: "The new category has been created successfully.",
      });
      setSelectedCategory(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create category",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({id, data}: {id: number, data: Partial<CategoryFormValues>}) => {
      const res = await apiRequest("PUT", `/api/admin/categories/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: "Category updated",
        description: "The category has been updated successfully.",
      });
      setSelectedCategory(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update category",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/admin/categories/${id}`);
      return res.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: "Category deleted",
        description: "The category has been deleted successfully.",
      });
      setCategoryToDelete(null);
      setIsDeleteDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete category",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const getTabTitle = () => {
    switch (activeTab) {
      case "dashboard": return "Dashboard Overview";
      case "pending": return "Pending Projects";
      case "approved": return "Approved Projects";
      case "users": return "User Management";
      case "stats": return "Analytics & Statistics";
      case "categories": return "Category Management";
      case "settings": return "Site Settings";
      default: return "Admin Dashboard";
    }
  };

  const getTabDescription = () => {
    switch (activeTab) {
      case "dashboard": return "Overview of your platform's performance and statistics";
      case "pending": return "Review and approve user-submitted projects";
      case "approved": return "Manage verification status of approved projects";
      case "users": return "Manage user roles and verification status";
      case "stats": return "Detailed analytics of your platform's performance";
      case "categories": return "Create and manage project categories";
      case "settings": return "Configure your site's appearance and settings";
      default: return "";
    }
  };

  return (
    <DashboardLayout
      title={getTabTitle()}
      description={getTabDescription()}
    >
      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid grid-cols-7 max-w-3xl mx-auto mb-6">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Pending</span>
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center gap-2">
            <Archive className="h-4 w-4" />
            <span className="hidden sm:inline">Approved</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <UserCog className="h-4 w-4" />
            <span className="hidden sm:inline">Users</span>
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            <span className="hidden sm:inline">Categories</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="space-y-6">
          <DashboardStats />
        </TabsContent>
        
        <TabsContent value="pending" className="space-y-6">
          <ProjectsManagement />
        </TabsContent>
        
        <TabsContent value="approved" className="space-y-6">
          <ProjectsManagement />
        </TabsContent>
        
        <TabsContent value="users" className="space-y-6">
          <UsersManagement />
        </TabsContent>
        
        <TabsContent value="stats" className="space-y-6">
          <DashboardStats />
        </TabsContent>
        
        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Manage Categories</CardTitle>
                <CardDescription>
                  Add, edit or remove project categories
                </CardDescription>
              </div>
              <DialogTrigger asChild>
                <Button 
                  size="sm"
                  onClick={() => setSelectedCategory(null)}
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Add Category
                </Button>
              </DialogTrigger>
            </CardHeader>
            <CardContent>
              {isCategoriesLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, index) => (
                    <Skeleton key={index} className="h-16 w-full" />
                  ))}
                </div>
              ) : categories && categories.length > 0 ? (
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{category.name}</h3>
                        <p className="text-sm text-muted-foreground">/{category.slug}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => setSelectedCategory(category)}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          className="text-red-500"
                          onClick={() => {
                            setCategoryToDelete(category);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2Icon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No categories found. Create your first category to get started.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Category Form Dialog */}
          <Dialog>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{selectedCategory ? "Edit Category" : "Create New Category"}</DialogTitle>
                <DialogDescription>
                  {selectedCategory 
                    ? "Edit the details of this category" 
                    : "Add a new category for projects to be classified under"
                  }
                </DialogDescription>
              </DialogHeader>
              
              <CategoryForm 
                category={selectedCategory}
                onSubmit={(data) => {
                  if (selectedCategory) {
                    updateCategoryMutation.mutate({
                      id: selectedCategory.id,
                      data
                    });
                  } else {
                    createCategoryMutation.mutate(data);
                  }
                }}
                isSubmitting={createCategoryMutation.isPending || updateCategoryMutation.isPending}
              />
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Category</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this category? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              
              {categoryToDelete && (
                <div className="p-4 border rounded-md">
                  <h3 className="font-medium">{categoryToDelete.name}</h3>
                  <p className="text-sm text-muted-foreground">/{categoryToDelete.slug}</p>
                </div>
              )}
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsDeleteDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => {
                    if (categoryToDelete) {
                      deleteCategoryMutation.mutate(categoryToDelete.id);
                    }
                  }}
                  disabled={deleteCategoryMutation.isPending}
                >
                  {deleteCategoryMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Delete Category
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Site Settings</CardTitle>
              <CardDescription>
                Manage your site name, description, colors, and other settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isSettingsLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, index) => (
                    <Skeleton key={index} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <SiteSettingsForm 
                  initialData={siteSettings as SiteSettings} 
                  onSettingsSaved={() => refetchSettings()}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}

interface CategoryFormProps {
  category: Category | null;
  onSubmit: (data: CategoryFormValues) => void;
  isSubmitting: boolean;
}

function CategoryForm({ category, onSubmit, isSubmitting }: CategoryFormProps) {
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: category?.name || "",
      slug: category?.slug || "",
      icon: category?.icon || "",
      description: category?.description || "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. DeFi Projects" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input placeholder="e.g. defi-projects" {...field} />
              </FormControl>
              <FormDescription>
                URL-friendly version of the name. Use only lowercase letters, numbers, and hyphens.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="icon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Icon (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g. coinbase" {...field} />
              </FormControl>
              <FormDescription>
                Icon name from Lucide icons or other icon libraries.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="A short description of this category"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <DialogFooter>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {category ? "Update Category" : "Create Category"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}