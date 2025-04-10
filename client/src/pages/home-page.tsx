import { useEffect, useState, useRef } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import ProjectCard from "@/components/project/project-card";
import { Project, Category, Journal } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { ChevronRight, ArrowRight, Gift, Wallet, BarChart3, Search, Wrench, ImageIcon, TrendingUp, GitBranch, MessageCircle, CheckCircle, ExternalLink, CalendarIcon, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";

export default function HomePage() {
  const { user } = useAuth();
  const { data: projects, isLoading: isProjectsLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: categories, isLoading: isCategoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: featuredJournals, isLoading: isJournalsLoading } = useQuery<Journal[]>({
    queryKey: ["/api/journals/featured"],
    refetchOnWindowFocus: false,
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

          <div className="mt-6 overflow-x-auto pb-2 -mx-4 px-4 hide-scrollbar">
            <div className="flex gap-3 min-w-max">
              {categories?.map((category) => (
                <Link key={category.id} href={`/category/${category.slug}`}>
                  <Button variant="outline" className="flex items-center gap-2 h-12 px-5 py-2 rounded-full text-sm font-medium border-border/40 hover:bg-gray-100 dark:hover:bg-gray-800">
                    <span className="text-blue-500">{getCategoryIcon(category.slug)}</span>
                    <span>{category.name}</span>
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Journals Section */}
      <section className="py-6 px-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-medium">Featured Content</h2>
          </div>

          <div className="flex overflow-x-auto pb-4 -mx-4 px-4 gap-4 snap-x snap-mandatory touch-pan-x hide-scrollbar">
            {isJournalsLoading ? (
              // Loading state for journals
              <>
                {[...Array(3)].map((_, index) => (
                  <Card key={index} className="flex-shrink-0 w-full sm:w-80 min-h-[260px] snap-start overflow-hidden relative">
                    <div className="p-4 h-full flex flex-col">
                      <Skeleton className="h-4 w-20 mb-4" />
                      <Skeleton className="h-32 w-full mb-4" />
                      <div className="mt-auto">
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full mt-1" />
                      </div>
                    </div>
                  </Card>
                ))}
              </>
            ) : !featuredJournals || featuredJournals.length === 0 ? (
              // No featured journals state
              <Card className="flex-shrink-0 w-full sm:w-80 min-h-[260px] snap-start overflow-hidden relative">
                <div className="p-6 h-full flex flex-col items-center justify-center text-center">
                  <h3 className="text-lg font-medium mb-2">No Featured Journals</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    There are no featured journal entries at the moment.
                  </p>
                  <Button asChild size="sm">
                    <Link href="/journals">Browse Journals</Link>
                  </Button>
                </div>
              </Card>
            ) : (
              // Featured journals
              featuredJournals.map((journal) => (
                <Card 
                  key={journal.id} 
                  className="flex-shrink-0 w-full sm:w-80 min-h-[260px] snap-start overflow-hidden relative bg-cover bg-center" 
                  style={{ 
                    backgroundImage: journal.coverImage 
                      ? `url("${journal.coverImage}")` 
                      : 'linear-gradient(to right, #4f46e5, #2563eb)'
                  }}
                >
                  <div className="absolute inset-0 bg-black/50"></div>
                  <div className="relative p-4 text-white h-full flex flex-col justify-between">
                    <div className="bg-white/20 text-white px-2 py-1 rounded-md text-xs self-start backdrop-blur-sm">
                      Journal
                    </div>
                    <div className="mt-auto">
                      <Link href={`/journals/${journal.id}`}>
                        <h3 className="text-lg font-bold mb-1 hover:underline">{journal.title}</h3>
                      </Link>
                      <p className="text-sm text-white/80 line-clamp-2">
                        {journal.excerpt || journal.content.substring(0, 120) + "..."}
                      </p>
                      <div className="flex items-center mt-2 text-xs text-white/70">
                        <CalendarIcon className="h-3 w-3 mr-1" />
                        <span>{formatDistanceToNow(new Date(journal.createdAt))}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Promoted Apps section */}
      <section className="py-6 px-4">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Promoted Apps</h2>
            <Button variant="ghost" size="sm" asChild className="text-blue-500 hover:text-blue-600">
              <Link href="/submit" className="flex items-center text-base">
                Add Your Project
              </Link>
            </Button>
          </div>

          {isProjectsLoading ? (
            <div className="space-y-6">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="flex items-start gap-4">
                  <Skeleton className="w-16 h-16 rounded-lg flex-shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-5 w-6" />
                      <Skeleton className="h-6 w-24" />
                    </div>
                    <Skeleton className="h-4 w-40" />
                  </div>
                </div>
              ))}
            </div>
          ) : projects && projects.filter(p => p.approved).length > 0 ? (
            <div className="space-y-5">
              {projects.filter(p => p.approved).slice(0, 3).map((project, index) => (
                <a
                  key={project.id}
                  href={project.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 group"
                >
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {project.iconUrl ? (
                      <img src={project.iconUrl} alt={project.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-2xl font-bold text-primary">
                        {project.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-xl text-gray-400">{index + 1}</span>
                      <h3 className="text-xl font-medium group-hover:underline">{project.name}</h3>
                    </div>
                    <p className="text-gray-500 text-base line-clamp-1">{project.description}</p>
                  </div>
                </a>
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
    <div className="mb-10">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          {title} <span className="text-gray-400">{projects.length}</span>
        </h2>
        <Link href={`/category/${slug}`} className="flex items-center text-gray-500">
          <ChevronRight className="h-5 w-5" />
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="flex items-center gap-4">
              <Skeleton className="w-12 h-12 rounded-xl" />
              <div className="flex-1">
                <Skeleton className="h-5 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
          ))}
        </div>
      ) : projects.length > 0 ? (
        <div className="space-y-4">
          {projects.slice(0, 3).map((project, index) => (
            <a
              key={project.id}
              href={project.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 group"
            >
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                {project.iconUrl ? (
                  <img src={project.iconUrl} alt={project.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-lg font-bold text-primary">
                    {project.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div className="text-muted-foreground text-sm flex items-center">
                    {index === 0 && <span className="text-blue-500">🥇</span>}
                    {index === 1 && <span className="text-gray-500">🥈</span>}
                    {index === 2 && <span className="text-amber-600">🥉</span>}
                    {index > 2 && <span>{index + 1}</span>}
                  </div>
                  <h3 className="font-medium truncate group-hover:text-primary">
                    {project.name}
                    {project.verified && (
                      <CheckCircle className="h-4 w-4 ml-1 text-blue-500 inline-block" />
                    )}
                  </h3>
                </div>
                <p className="text-muted-foreground text-sm truncate">
                  {project.description}
                </p>
              </div>
            </a>
          ))}
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">No {title.toLowerCase()} projects available yet.</p>
        </div>
      )}
    </div>
  );
}