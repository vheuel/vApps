import { useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import CategoryTabs from "@/components/project/category-tabs";
import ProjectCard from "@/components/project/project-card";
import { Project, Category } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { ChevronRight, Gift, Wallet, BarChart3, Search, Wrench, ImageIcon, TrendingUp, GitBranch, MessageCircle, CheckCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function HomePage() {
  const { user } = useAuth();
  const { data: projects, isLoading: isProjectsLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: categories, isLoading: isCategoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Function to get projects by category slug
  const getProjectsByCategory = (categorySlug: string) => {
    return projects?.filter(project => project.category === categorySlug) || [];
  };

  // Category icon mapping
  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case 'airdrop': return <Gift className="w-5 h-5" />;
      case 'wallets': return <Wallet className="w-5 h-5" />;
      case 'exchanges': return <BarChart3 className="w-5 h-5" />;
      case 'explorers': return <Search className="w-5 h-5" />;
      case 'utilities': return <Wrench className="w-5 h-5" />;
      case 'nft': return <ImageIcon className="w-5 h-5" />;
      case 'staking': return <TrendingUp className="w-5 h-5" />;
      case 'bridges': return <GitBranch className="w-5 h-5" />;
      case 'channels': return <MessageCircle className="w-5 h-5" />;
      default: return <CheckCircle className="w-5 h-5" />;
    }
  };

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
          
          <div className="mt-6 flex flex-wrap gap-3">
            {categories?.slice(0, 3).map((category) => (
              <Link key={category.id} href={`/category/${category.slug}`}>
                <Button variant="outline" className="flex items-center">
                  {getCategoryIcon(category.slug)}
                  <span className="ml-2">{category.name}</span>
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Promoted Apps section */}
      <section className="py-6 px-4">
        <div className="container mx-auto">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Promoted Apps</h2>
            <Link href="/submit" className="text-primary text-sm">
              Add Your Project
            </Link>
          </div>
          
          {isProjectsLoading ? (
            <div className="space-y-4 mt-4">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="bg-card rounded-lg border p-4">
                  <div className="flex items-start">
                    <Skeleton className="w-12 h-12 rounded-lg" />
                    <div className="ml-4 space-y-2 flex-1">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : projects && projects.filter(p => p.approved).length > 0 ? (
            <div className="space-y-4 mt-4">
              {projects.filter(p => p.approved).slice(0, 3).map((project, index) => (
                <div key={project.id} className="flex">
                  <div className="w-8 text-center pt-2 font-medium text-muted-foreground">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <ProjectCard project={project} showVerificationIcon={project.approved} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 mt-4">
              <p className="text-muted-foreground">No promoted projects available yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* Wallets section */}
      <CategorySection 
        title="Wallets" 
        slug="wallets"
        count={getProjectsByCategory('wallets').length}
        isLoading={isProjectsLoading}
        projects={getProjectsByCategory('wallets').slice(0, 3)}
      />
      
      {/* Exchanges DEX section */}
      <CategorySection 
        title="Exchanges DEX" 
        slug="exchanges"
        count={getProjectsByCategory('exchanges').length}
        isLoading={isProjectsLoading}
        projects={getProjectsByCategory('exchanges').slice(0, 3)}
      />
      
      {/* Explorers section */}
      <CategorySection 
        title="Explorers" 
        slug="explorers"
        count={getProjectsByCategory('explorers').length}
        isLoading={isProjectsLoading}
        projects={getProjectsByCategory('explorers').slice(0, 3)}
      />
      
      {/* Utilities section */}
      <CategorySection 
        title="Utilities" 
        slug="utilities"
        count={getProjectsByCategory('utilities').length}
        isLoading={isProjectsLoading}
        projects={getProjectsByCategory('utilities').slice(0, 3)}
      />
      
      {/* NFT Services section */}
      <CategorySection 
        title="NFT Services" 
        slug="nft"
        count={getProjectsByCategory('nft').length}
        isLoading={isProjectsLoading}
        projects={getProjectsByCategory('nft').slice(0, 3)}
      />
      
      {/* Staking section */}
      <CategorySection 
        title="Staking" 
        slug="staking"
        count={getProjectsByCategory('staking').length}
        isLoading={isProjectsLoading}
        projects={getProjectsByCategory('staking').slice(0, 3)}
      />
      
      {/* Bridges section */}
      <CategorySection 
        title="Bridges" 
        slug="bridges"
        count={getProjectsByCategory('bridges').length}
        isLoading={isProjectsLoading}
        projects={getProjectsByCategory('bridges').slice(0, 3)}
      />
      
      {/* Channels section */}
      <CategorySection 
        title="Channels" 
        slug="channels"
        count={getProjectsByCategory('channels').length}
        isLoading={isProjectsLoading}
        projects={getProjectsByCategory('channels').slice(0, 3)}
      />

      {/* Explore all categories section */}
      <section className="py-8 px-4 bg-muted/10 border-t border-border/20">
        <div className="container mx-auto text-center">
          <div className="py-4 max-w-lg mx-auto">
            <div className="bg-background/80 backdrop-blur-sm p-6 rounded-xl border border-border/30">
              <h2 className="text-2xl font-bold mb-4">Explore all categories</h2>
              <p className="text-muted-foreground mb-6">
                Discover The Open Network with the help of EARN App. Explore trending dApps, NFT collections, 
                marketplaces, DeFi tools and much more. Go ahead and dive into the Web3 world!
              </p>
              <Button size="lg" className="mx-auto">
                <span className="mr-2 grid grid-cols-3 grid-rows-3 gap-0.5">
                  {[...Array(9)].map((_, i) => (
                    <span key={i} className="w-1 h-1 bg-current rounded-full"></span>
                  ))}
                </span>
                All categories
              </Button>
            </div>
          </div>
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

// Reusable category section component
function CategorySection({ 
  title, 
  slug, 
  count = 0,
  isLoading, 
  projects = [] 
}: { 
  title: string; 
  slug: string; 
  count?: number;
  isLoading: boolean; 
  projects: Project[];
}) {
  return (
    <section className="py-6 px-4 border-t border-border/20">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <h2 className="text-xl font-bold">{title}</h2>
            {count > 0 && (
              <span className="ml-2 text-muted-foreground text-sm">{count}</span>
            )}
          </div>
          <Link href={`/category/${slug}`} className="text-primary flex items-center text-sm">
            <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="flex">
                <div className="w-8 text-center">
                  <Skeleton className="h-6 w-6 rounded-full mx-auto" />
                </div>
                <div className="flex-1">
                  <Skeleton className="h-24 w-full rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : projects.length > 0 ? (
          <div className="space-y-4">
            {projects.map((project, index) => (
              <div key={project.id} className="flex">
                <div className="w-8 text-center pt-2 font-medium text-muted-foreground">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <ProjectCard project={project} showVerificationIcon={project.approved} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No {title.toLowerCase()} projects available yet.</p>
          </div>
        )}
      </div>
    </section>
  );
}
