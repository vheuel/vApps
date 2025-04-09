import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Project, Category, InsertCategory, SiteSettings } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SiteSettingsForm } from "@/components/admin/site-settings-form";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckIcon, XIcon, Loader2, PlusIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState, useEffect } from "react";
import ProjectCard from "@/components/project/project-card";

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
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  
  // Site settings query
  const { data: siteSettings, isLoading: isSettingsLoading, refetch: refetchSettings } = useQuery<SiteSettings>({
    queryKey: ["/api/site-settings"],
  });

  const { data: pendingProjects, isLoading, isError, error } = useQuery<Project[]>({
    queryKey: ["/api/admin/projects/pending"],
    refetchOnWindowFocus: true,
    retry: 3,
  });
  
  // Debugging untuk melihat apakah ada error
  useEffect(() => {
    if (isError) {
      console.error("Error fetching pending projects:", error);
    }
    if (pendingProjects) {
      console.log("Pending projects from query:", pendingProjects);
    }
  }, [pendingProjects, isError, error]);

  const { data: allProjects } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });
  
  const { data: categories, isLoading: isCategoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const approveMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("POST", `/api/admin/projects/${id}/approve`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/projects/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Project approved",
        description: "The project has been approved and is now live.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to approve project",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("POST", `/api/admin/projects/${id}/reject`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/projects/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Project rejected",
        description: "The project has been rejected.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to reject project",
        description: error.message,
        variant: "destructive",
      });
    }
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

  // Get category counts for approved projects
  const getCategoryCounts = () => {
    if (!allProjects) return {};
    
    const approvedProjects = allProjects.filter(p => p.approved);
    return approvedProjects.reduce((acc, project) => {
      acc[project.category] = (acc[project.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  };

  const categoryCounts = getCategoryCounts();

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{allProjects?.length || 0}</div>
            <p className="text-muted-foreground">Total Projects</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{allProjects?.filter(p => p.approved).length || 0}</div>
            <p className="text-muted-foreground">Approved Projects</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{pendingProjects?.length || 0}</div>
            <p className="text-muted-foreground">Pending Approval</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending">
        <div className="overflow-x-auto">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="pending">Pending Projects</TabsTrigger>
            <TabsTrigger value="approved">Approved Projects</TabsTrigger>
            <TabsTrigger value="stats">Category Stats</TabsTrigger>
            <TabsTrigger value="categories">Manage Categories</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Projects Awaiting Approval</CardTitle>
              <CardDescription>
                Review and approve or reject user-submitted projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, index) => (
                    <Skeleton key={index} className="h-24 w-full" />
                  ))}
                </div>
              ) : pendingProjects && pendingProjects.length > 0 ? (
                <div className="space-y-4">
                  {pendingProjects.map((project) => (
                    <div key={project.id}>
                      <ProjectCard 
                        project={project}
                        showAdminActions={project.pending && !project.approved}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No pending projects to review.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="approved">
          <Card>
            <CardHeader>
              <CardTitle>Approved Projects</CardTitle>
              <CardDescription>
                Manage verification status of approved projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, index) => (
                    <Skeleton key={index} className="h-24 w-full" />
                  ))}
                </div>
              ) : allProjects && allProjects.filter(p => p.approved && !p.pending).length > 0 ? (
                <div className="space-y-4">
                  {allProjects
                    .filter(p => p.approved && !p.pending)
                    .map((project) => (
                      <div key={project.id}>
                        <ProjectCard 
                          project={project}
                          showAdminActions={true}
                          showVerificationIcon={true}
                        />
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No approved projects found.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="stats">
          <Card>
            <CardHeader>
              <CardTitle>Category Statistics</CardTitle>
              <CardDescription>
                Distribution of approved projects by category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(categoryCounts).length > 0 ? (
                  Object.entries(categoryCounts)
                    .sort((a, b) => b[1] - a[1])
                    .map(([category, count]) => (
                      <div key={category}>
                        <div className="flex justify-between mb-1">
                          <span className="capitalize">{category}</span>
                          <span>{count}</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2.5">
                          <div 
                            className="bg-primary h-2.5 rounded-full" 
                            style={{ 
                              width: `${(count / (allProjects?.filter(p => p.approved).length || 1)) * 100}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No approved projects to display statistics.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="categories">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Manage Categories</CardTitle>
                <CardDescription>
                  Add, edit, or remove project categories
                </CardDescription>
              </div>
              <Dialog open={!!selectedCategory} onOpenChange={(open) => !open && setSelectedCategory(null)}>
                <DialogTrigger asChild>
                  <Button size="sm" onClick={() => setSelectedCategory({} as Category)}>
                    <PlusIcon className="h-4 w-4 mr-1" />
                    Add Category
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>
                      {selectedCategory && selectedCategory.id ? "Edit Category" : "Add New Category"}
                    </DialogTitle>
                    <DialogDescription>
                      {selectedCategory && selectedCategory.id
                        ? "Update the category details below."
                        : "Create a new category for projects."}
                    </DialogDescription>
                  </DialogHeader>
                  <CategoryForm 
                    category={selectedCategory} 
                    onSubmit={(data) => {
                      if (selectedCategory && selectedCategory.id) {
                        updateCategoryMutation.mutate({
                          id: selectedCategory.id,
                          data
                        });
                      } else {
                        createCategoryMutation.mutate(data);
                      }
                    }}
                    isPending={createCategoryMutation.isPending || updateCategoryMutation.isPending}
                  />
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {isCategoriesLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, index) => (
                    <Skeleton key={index} className="h-16 w-full" />
                  ))}
                </div>
              ) : categories && categories.length > 0 ? (
                <div className="space-y-4">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {category.icon && (
                          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10 text-primary">
                            <span className="text-lg">{category.icon}</span>
                          </div>
                        )}
                        <div>
                          <h3 className="font-medium">{category.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {category.description || `Slug: ${category.slug}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedCategory(category)}
                        >
                          <PencilIcon className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-500 hover:bg-red-50"
                          onClick={() => {
                            setCategoryToDelete(category);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2Icon className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No categories found. Add your first category.</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Delete Confirmation Dialog */}
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete the category "{categoryToDelete?.name}"? 
                  This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsDeleteDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => categoryToDelete && deleteCategoryMutation.mutate(categoryToDelete.id)}
                  disabled={deleteCategoryMutation.isPending}
                >
                  {deleteCategoryMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : null}
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>
        
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Website Settings</CardTitle>
              <CardDescription>
                Customize appearance and content of your website
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isSettingsLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <SiteSettingsForm 
                  initialData={siteSettings || {
                    id: 0,
                    siteName: "Web3 Project",
                    logoUrl: "",
                    primaryColor: "#3B82F6",
                    footerText: "© 2025 Web3 Project. All Rights Reserved.",
                    createdAt: null,
                    updatedAt: null
                  } as SiteSettings}
                  onSettingsSaved={() => {
                    refetchSettings();
                    // Also refresh the client to apply theme changes
                    setTimeout(() => {
                      window.location.reload();
                    }, 1000);
                  }}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Category Form Component
interface CategoryFormProps {
  category: Category | null;
  onSubmit: (data: CategoryFormValues) => void;
  isPending: boolean;
}

function CategoryForm({ category, onSubmit, isPending }: CategoryFormProps) {
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: category?.name || "",
      slug: category?.slug || "",
      icon: category?.icon || "",
      description: category?.description || "",
    },
  });

  function handleSubmit(data: CategoryFormValues) {
    onSubmit(data);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter category name" {...field} />
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
                <Input placeholder="category-slug" {...field} />
              </FormControl>
              <FormDescription>
                Unique identifier used in URLs (lowercase, hyphens only)
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
                <Input placeholder="Enter icon name" {...field} />
              </FormControl>
              <FormDescription>
                Lucide icon name or emoji
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
                  placeholder="Enter a brief description of this category" 
                  className="resize-none" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <DialogFooter>
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : null}
            {category && category.id ? "Update" : "Create"} Category
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
