import React, { useEffect, useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import ProjectCard from "@/components/project/project-card";
import { Project, Category } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { ChevronRight, ArrowRight, Gift, Wallet, BarChart3, Search, Wrench, ImageIcon, TrendingUp, GitBranch, MessageCircle, CheckCircle, ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

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
    // Get all projects for this category
    const filteredProjects = projects?.filter(project => project.category === categorySlug) || [];
    
    // Add some dummy projects if we need to test pagination for wallets and exchanges
    if ((categorySlug === 'wallets' || categorySlug === 'exchanges') && filteredProjects.length < 6) {
      const dummyCount = Math.max(0, 9 - filteredProjects.length);
      for (let i = 0; i < dummyCount; i++) {
        // Clone a project to create dummy ones for pagination demo
        if (filteredProjects.length > 0) {
          const baseProject = {...filteredProjects[0]};
          filteredProjects.push({
            ...baseProject,
            id: baseProject.id + 100 + i,
            name: `${baseProject.name} ${i+filteredProjects.length+1}`,
          });
        }
      }
    }
    
    // Return all projects for this category
    return filteredProjects;
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
      <section className="pt-8 pb-6 md:pt-12 md:pb-8 px-4">
        <div className="container mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold">
            Welcome to new<br />
            <span className="text-blue-500">community driven</span> catalog
          </h1>
          
          <div className="mt-6 flex flex-wrap gap-3">
            {categories?.map((category) => (
              <Link key={category.id} href={`/category/${category.slug}`}>
                <Button variant="outline" className="flex items-center gap-2 h-10 px-4 py-2 rounded-md text-sm font-medium border-border/40 hover:bg-gray-100 dark:hover:bg-gray-800">
                  {getCategoryIcon(category.slug)}
                  <span>{category.name}</span>
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Articles/News Section (TON.app uses for market info) */}
      <section className="py-6 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Market Data Card */}
            <Card className="overflow-hidden relative bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
              <div className="p-4">
                <div className="mb-4">
                  <div className="text-lg font-bold">TON</div>
                  <div className="text-2xl font-bold">$2.98</div>
                  <div className="text-red-500 text-sm">-0.81%</div>
                </div>
                
                <div className="mt-4 text-sm text-muted-foreground">
                  <div className="flex justify-between mb-1">
                    <span>Rank</span>
                    <span className="font-medium">#12</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span>Market Cap</span>
                    <span className="font-medium">$7B</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Volume</span>
                    <span className="font-medium">$2M</span>
                  </div>
                </div>
                
                {/* Simplified price chart (just for visual) */}
                <div className="h-16 mt-4 bg-gradient-to-r from-red-100 to-red-200 dark:from-red-900/20 dark:to-red-800/20 rounded-lg opacity-70"></div>
              </div>
            </Card>
            
            {/* Featured Article 1 */}
            <Card className="overflow-hidden relative bg-cover bg-center" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1639322537504-6427a16b0a28?q=80&w=500&auto=format&fit=crop")' }}>
              <div className="absolute inset-0 bg-black/50"></div>
              <div className="relative p-4 text-white h-full flex flex-col justify-between">
                <div className="bg-white/20 text-white px-2 py-1 rounded-md text-xs self-start backdrop-blur-sm">
                  Interview
                </div>
                <div className="mt-auto">
                  <h3 className="text-lg font-bold mb-1">Accelerating the Future: Building the Ecosystem for Startups</h3>
                  <p className="text-sm text-white/80 line-clamp-2">
                    How blockchain technology is transforming startup ecosystems and creating new opportunities.
                  </p>
                </div>
              </div>
            </Card>
            
            {/* Featured Article 2 */}
            <Card className="overflow-hidden relative bg-cover bg-center" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=500&auto=format&fit=crop")' }}>
              <div className="absolute inset-0 bg-black/50"></div>
              <div className="relative p-4 text-white h-full flex flex-col justify-between">
                <div className="bg-white/20 text-white px-2 py-1 rounded-md text-xs self-start backdrop-blur-sm">
                  Interview
                </div>
                <div className="mt-auto">
                  <h3 className="text-lg font-bold mb-1">How Blockchain Technology Makes Crypto More Accessible</h3>
                  <p className="text-sm text-white/80 line-clamp-2">
                    A conversation about improving blockchain accessibility and user experience.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Promoted Apps section */}
      <section className="py-6 px-4">
        <div className="container mx-auto">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Promoted Apps</h2>
            <Button variant="ghost" size="sm" asChild className="text-blue-500 hover:text-blue-600">
              <Link href="/submit" className="flex items-center gap-1">
                Add Your Project <span className="ml-1">+</span>
              </Link>
            </Button>
          </div>
          
          {isProjectsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                  <Skeleton className="w-10 h-10 rounded-md flex-shrink-0" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                </div>
              ))}
            </div>
          ) : projects && projects.filter(p => p.approved).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {projects.filter(p => p.approved).slice(0, 3).map((project, index) => (
                <div key={project.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center flex-shrink-0">
                    {project.iconUrl ? (
                      <img src={project.iconUrl} alt={project.name} className="w-full h-full object-cover rounded-md" />
                    ) : (
                      <div className="text-lg font-bold text-primary">
                        {project.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center">
                      <span className="text-muted-foreground mr-2">{index + 1}</span>
                      <h3 className="font-medium">{project.name}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">{project.description}</p>
                  </div>
                  <a 
                    href={project.websiteUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-muted-foreground"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </a>
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

      {/* Categories with Projects */}
      <div className="py-6 px-4 border-t border-border/20">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Categories Column 1 */}
            <div>
              <CategorySection 
                title="Wallets" 
                slug="wallets"
                count={getProjectsByCategory('wallets').length}
                isLoading={isProjectsLoading}
                projects={getProjectsByCategory('wallets')}
              />
              
              <CategorySection 
                title="NFT Services" 
                slug="nft"
                count={getProjectsByCategory('nft').length}
                isLoading={isProjectsLoading}
                projects={getProjectsByCategory('nft').slice(0, 3)}
              />
              
              <CategorySection 
                title="Bridges" 
                slug="bridges"
                count={getProjectsByCategory('bridges').length}
                isLoading={isProjectsLoading}
                projects={getProjectsByCategory('bridges').slice(0, 3)}
              />
              
              <CategorySection 
                title="Utilities" 
                slug="utilities"
                count={getProjectsByCategory('utilities').length}
                isLoading={isProjectsLoading}
                projects={getProjectsByCategory('utilities').slice(0, 3)}
              />
            </div>
            
            {/* Categories Column 2 */}
            <div>
              <CategorySection 
                title="Exchanges DEX" 
                slug="exchanges"
                count={getProjectsByCategory('exchanges').length}
                isLoading={isProjectsLoading}
                projects={getProjectsByCategory('exchanges')}
              />
              
              <CategorySection 
                title="Staking" 
                slug="staking"
                count={getProjectsByCategory('staking').length}
                isLoading={isProjectsLoading}
                projects={getProjectsByCategory('staking').slice(0, 3)}
              />
              
              <CategorySection 
                title="Explorers" 
                slug="explorers"
                count={getProjectsByCategory('explorers').length}
                isLoading={isProjectsLoading}
                projects={getProjectsByCategory('explorers').slice(0, 3)}
              />
              
              <CategorySection 
                title="Channels" 
                slug="channels"
                count={getProjectsByCategory('channels').length}
                isLoading={isProjectsLoading}
                projects={getProjectsByCategory('channels').slice(0, 3)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* CTA section */}
      {!user && (
        <section className="py-12 px-4 bg-blue-50 dark:bg-blue-950/20 border-y border-border/40">
          <div className="container mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Join Our Community</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
              Register an account to submit your own projects and contribute to the Web3 community catalog.
            </p>
            <Button asChild size="lg" className="bg-blue-500 hover:bg-blue-600 text-white">
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
  // Store all projects for reference
  const allProjects = projects; 
  
  // For pagination, show 3 projects per page
  const [currentPage, setCurrentPage] = useState(0);
  const projectsPerPage = 3;
  const pageCount = Math.ceil(projects.length / projectsPerPage);
  
  // Get current page projects - simulate the slider effect
  const getCurrentPageProjects = () => {
    const startIndex = currentPage * projectsPerPage;
    return projects.slice(startIndex, startIndex + projectsPerPage);
  };
  
  // Next page function
  const nextPage = () => {
    if (currentPage < pageCount - 1) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  // Previous page function
  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-medium">{title}</h2>
          {count > 0 && (
            <span className="text-muted-foreground text-base">{count}</span>
          )}
          {pageCount > 1 && (
            <div className="flex items-center gap-1 ml-4">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 rounded-full bg-gray-100 dark:bg-gray-800"
                onClick={prevPage}
                disabled={currentPage === 0}
              >
                <ChevronRight className="h-3 w-3 rotate-180" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 rounded-full bg-gray-100 dark:bg-gray-800"
                onClick={nextPage}
                disabled={currentPage === pageCount - 1}
              >
                <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
        <Link href={`/category/${slug}`} className="text-blue-500 text-sm flex items-center">
          See all <ChevronRight className="ml-1 h-4 w-4" />
        </Link>
      </div>
      
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="flex items-center gap-2">
              <Skeleton className="w-5 h-5 rounded-full" />
              <Skeleton className="h-12 w-12 rounded-lg flex-shrink-0" />
              <div className="flex-1">
                <Skeleton className="h-5 w-full mb-1" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <Skeleton className="h-4 w-4 rounded-full" />
            </div>
          ))}
        </div>
      ) : projects.length > 0 ? (
        <div className="space-y-4">
          {getCurrentPageProjects().map((project) => {
            // Calculate the actual index across all projects
            const globalIndex = allProjects.findIndex(p => p.id === project.id);
            
            return (
              <div key={project.id} className="flex items-start gap-3">
                <div className="text-muted-foreground text-gray-400 font-medium flex items-center mt-2">
                  <span className="font-serif">{globalIndex + 1}</span>
                </div>
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                  {project.iconUrl ? (
                    <img src={project.iconUrl} alt={project.name} className="w-10 h-10 object-cover rounded-md" />
                  ) : (
                    <div className="text-lg font-bold text-primary">
                      {project.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1">
                    <h3 className="font-medium text-base">{project.name}</h3>
                    {project.approved && (
                      <CheckCircle className="h-4 w-4 text-blue-500" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1">{project.description}</p>
                </div>
                <a 
                  href={project.websiteUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground mt-2"
                >
                  <ArrowRight className="h-5 w-5" />
                </a>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">No {title.toLowerCase()} projects available yet.</p>
        </div>
      )}
    </div>
  );
}
