import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { Project } from "@shared/schema";
import CategoryTabs from "@/components/project/category-tabs";
import ProjectCard from "@/components/project/project-card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

export default function CategoryPage() {
  const { category } = useParams();
  const [_, navigate] = useLocation();
  const { user } = useAuth();

  // Validate category param
  useEffect(() => {
    const validCategories = [
      "airdrop", "wallets", "exchanges", "explorers", 
      "utilities", "nft", "staking", "bridges", "channels"
    ];
    if (!validCategories.includes(category)) {
      navigate("/");
    }
  }, [category, navigate]);

  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: [`/api/projects/category/${category}`],
    enabled: !!category,
  });

  // Format category name for display
  const formatCategoryName = (cat: string) => {
    return cat.charAt(0).toUpperCase() + cat.slice(1);
  };

  return (
    <>
      <div className="container mx-auto py-6 px-4">
        <h1 className="text-3xl font-bold mb-6">{formatCategoryName(category)}</h1>
        
        <CategoryTabs />
        
        <div className="mt-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, index) => (
                <Skeleton key={index} className="h-40 w-full" />
              ))}
            </div>
          ) : projects && projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                No projects found in the {formatCategoryName(category)} category.
              </p>
              {user ? (
                <Button asChild>
                  <Link href="/submit">Add the first project</Link>
                </Button>
              ) : (
                <Button asChild>
                  <Link href="/auth">Sign in to add a project</Link>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
