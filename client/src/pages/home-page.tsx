import { useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import CategoryTabs from "@/components/project/category-tabs";
import ProjectCard from "@/components/project/project-card";
import { Project } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { ChevronRight, Gift, Wallet, BarChart3 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function HomePage() {
  const { user } = useAuth();
  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  return (
    <>
      {/* Hero section */}
      <section className="py-8 md:py-12 px-4">
        <div className="container mx-auto">
          <h1 className="text-3xl md:text-5xl font-bold mb-2">
            Welcome to new<br />
            <span className="text-primary">community driven</span><br />
            catalog
          </h1>
          
          <div className="mt-8">
            <CategoryTabs />
          </div>
        </div>
      </section>

      {/* Latest Apps section */}
      <section className="py-6 px-4">
        <div className="container mx-auto">
          <h2 className="text-2xl font-bold mb-2">Latest Apps</h2>
          <p className="text-muted-foreground mb-6">Discover the newest projects</p>
          
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="bg-card rounded-lg border p-4">
                  <div className="flex items-start">
                    <Skeleton className="w-12 h-12 rounded-lg" />
                    <div className="ml-4 space-y-2 flex-1">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-1/4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : projects && projects.length > 0 ? (
            <div className="space-y-4">
              {projects.slice(0, 4).map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No projects available yet.</p>
              {user && (
                <Button asChild className="mt-4">
                  <Link href="/submit">Submit the first project</Link>
                </Button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Airdrop section */}
      <section className="py-6 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Airdrop</h2>
            <Link href="/category/airdrop" className="text-primary flex items-center text-sm">
              See all <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <p className="text-muted-foreground mb-6">Discover and participate in cryptocurrency airdrops</p>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, index) => (
                <Skeleton key={index} className="h-40 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects
                ?.filter(project => project.category === 'airdrop')
                .slice(0, 3)
                .map(project => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              
              {(!projects || projects.filter(p => p.category === 'airdrop').length === 0) && (
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground">No airdrop projects available yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* CTA section */}
      {!user && (
        <section className="py-12 px-4 bg-primary/5 border-y border-border/40">
          <div className="container mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Join Our Community</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
              Register an account to submit your own projects and contribute to the Web3 community catalog.
            </p>
            <Button asChild size="lg">
              <Link href="/auth">Sign Up Now</Link>
            </Button>
          </div>
        </section>
      )}
    </>
  );
}
