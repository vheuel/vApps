import { useEffect, useState, useRef } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import ProjectCard from "@/components/project/project-card";
import { Project, Category } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { ChevronRight, ArrowRight, Gift, Wallet, BarChart3, Search, Wrench, ImageIcon, TrendingUp, GitBranch, MessageCircle, CheckCircle, ExternalLink, ChevronLeft } from "lucide-react";
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

      {/* Featured Articles/News Section (TON.app uses for market info) */}
      <section className="py-6 px-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-medium">Featured Content</h2>
          </div>

          <div className="flex overflow-x-auto pb-4 -mx-4 px-4 gap-4 snap-x snap-mandatory touch-pan-x hide-scrollbar">
            {/* Market Data Card */}
            <Card className="flex-shrink-0 w-full sm:w-80 min-h-[260px] snap-start overflow-hidden relative bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
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
            <Card className="flex-shrink-0 w-full sm:w-80 min-h-[260px] snap-start overflow-hidden relative bg-cover bg-center" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1639322537504-6427a16b0a28?q=80&w=500&auto=format&fit=crop")' }}>
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
            <Card className="flex-shrink-0 w-full sm:w-80 min-h-[260px] snap-start overflow-hidden relative bg-cover bg-center" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=500&auto=format&fit=crop")' }}>
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

            {/* Featured Article 3 */}
            <Card className="flex-shrink-0 w-full sm:w-80 min-h-[260px] snap-start overflow-hidden relative bg-cover bg-center" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1642104704074-907c0698cbd9?q=80&w=500&auto=format&fit=crop")' }}>
              <div className="absolute inset-0 bg-black/50"></div>
              <div className="relative p-4 text-white h-full flex flex-col justify-between">
                <div className="bg-white/20 text-white px-2 py-1 rounded-md text-xs self-start backdrop-blur-sm">
                  News
                </div>
                <div className="mt-auto">
                  <h3 className="text-lg font-bold mb-1">The Rise of DeFi: Transforming Financial Landscape</h3>
                  <p className="text-sm text-white/80 line-clamp-2">
                    Exploring how decentralized finance is changing traditional financial systems and creating new opportunities.
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
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const handleScroll = (direction: 'prev' | 'next') => {
    if (direction === 'next') {
      setCurrentPage(Math.min(currentPage + 1, totalPages - 1));
    } else {
      setCurrentPage(Math.max(currentPage - 1, 0));
    }
  };

  useEffect(() => {
    setTotalPages(Math.ceil(projects.length / 3));
  }, [projects.length]);


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
        <div className="space-y-4 relative">
          {projects.slice(currentPage * 3, (currentPage + 1) * 3).map((project, index) => (
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
          {totalPages > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 ${
                  currentPage === 0 ? 'opacity-0' : 'opacity-100'
                }`}
                onClick={() => handleScroll('prev')}
                disabled={currentPage === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 ${
                  currentPage === totalPages - 1 ? 'opacity-0' : 'opacity-100'
                }`}
                onClick={() => handleScroll('next')}
                disabled={currentPage === totalPages - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">No {title.toLowerCase()} projects available yet.</p>
        </div>
      )}
    </div>
  );
}