import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { Project, Category } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ExternalLink, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// Kategori deskripsi hardcoded (sebagai alternatif dari pemanggilan API)
const categoryDescriptions: Record<string, string> = {
  "airdrop": "Dapatkan token gratis dan hadiah melalui airdrop crypto. Temukan program distribusi token terbaru dan kesempatan mendapatkan token gratis melalui platform dan proyek blockchain.",
  "wallets": "Simpan dan kelola aset crypto Anda dengan aman. Temukan dompet yang menawarkan fitur keamanan tingkat lanjut, antarmuka yang mudah digunakan, dan dukungan untuk berbagai cryptocurrency.",
  "exchanges": "Platform untuk membeli, menjual, dan menukar cryptocurrencies. Temukan bursa terpusat dan terdesentralisasi dengan likuiditas tinggi, biaya rendah, dan keamanan yang baik.",
  "explorers": "Jelajahi dan analisis transaksi blockchain. Alat dan platform untuk melihat riwayat transaksi, saldo alamat, dan data blockchain lainnya.",
  "utilities": "Alat dan layanan yang berguna untuk pengguna crypto. Dapatkan akses ke calculator biaya gas, generator alamat wallet, dan utilities lainnya.",
  "nft": "Marketplace dan layanan untuk non-fungible tokens. Temukan platform untuk membeli, menjual, dan mencetak NFT dengan biaya rendah dan komunitas aktif.",
  "staking": "Dapatkan rewards dengan staking cryptocurrency Anda. Platform untuk mendapatkan yield passive income melalui proof-of-stake dan protokol DeFi.",
  "bridges": "Solusi untuk transfer aset antar blockchain. Jembatan lintas rantai yang memungkinkan Anda memindahkan crypto di berbagai jaringan dengan aman.",
  "channels": "Komunitas dan sumber informasi crypto terpercaya. Temukan channel telegram, discord, dan platform media sosial untuk berita dan diskusi crypto terbaru."
};

// Set category icons (contoh)
const categoryIcons: Record<string, React.ReactNode> = {
  "channels": (
    <div className="bg-blue-500 rounded-lg w-16 h-16 flex items-center justify-center">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-10 h-10">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zM6.5 9L10 5.5 13.5 9H11v4H9V9zm11 6L14 18.5 10.5 15H13v-4h2v4z" />
      </svg>
    </div>
  ),
  "wallets": (
    <div className="bg-green-500 rounded-lg w-16 h-16 flex items-center justify-center">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-10 h-10">
        <path d="M18 4H6C3.79 4 2 5.79 2 8v8c0 2.21 1.79 4 4 4h12c2.21 0 4-1.79 4-4V8c0-2.21-1.79-4-4-4zm-1 12h-2c-.55 0-1-.45-1-1s.45-1 1-1h2c.55 0 1 .45 1 1s-.45 1-1 1zm1-6H6V8h12v2z" />
      </svg>
    </div>
  ),
  "default": (
    <div className="bg-primary rounded-lg w-16 h-16 flex items-center justify-center">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-10 h-10">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
      </svg>
    </div>
  )
};

export default function CategoryPage() {
  const params = useParams<{ category: string }>();
  const category = params.category || "";
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

  const { data: categoryData } = useQuery<Category>({
    queryKey: [`/api/categories/slug/${category}`],
    enabled: category !== "",
  });

  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: [`/api/projects/category/${category}`],
    enabled: category !== "",
  });

  // Format category name for display
  const formatCategoryName = (cat: string) => {
    return cat.charAt(0).toUpperCase() + cat.slice(1);
  };

  // Get category description
  const categoryDescription = categoryData?.description || 
    (category && categoryDescriptions[category]) || "";

  // Get category icon
  const getCategoryIcon = (cat: string) => {
    return categoryIcons[cat] || categoryIcons["default"];
  };

  return (
    <>
      <div className="container mx-auto py-6 px-4">
        <div className="flex items-center mb-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate("/")}
            className="mr-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold flex items-center">
            {formatCategoryName(category)}
            {categoryData && (
              <span className="ml-2 text-muted-foreground text-sm">{projects?.length || 0}</span>
            )}
          </h1>
        </div>
        
        {categoryDescription && (
          <p className="text-muted-foreground mb-6">{categoryDescription}</p>
        )}
        
        <div className="mt-6">
          {isLoading ? (
            <div className="space-y-6">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="flex gap-4">
                  <Skeleton className="w-16 h-16 rounded-lg flex-shrink-0" />
                  <div className="flex-1">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : projects && projects.length > 0 ? (
            <div className="space-y-6">
              {projects.map((project, index) => (
                <div key={project.id} className="flex items-start gap-4">
                  <div className="text-lg font-medium text-muted-foreground w-6 text-center pt-2">
                    {index + 1}
                  </div>
                  
                  {getCategoryIcon(category)}
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">
                        {project.name}
                        {project.verified && (
                          <CheckCircle className="w-4 h-4 ml-1 text-blue-500 inline" />
                        )}
                      </h3>
                      {project.websiteUrl && (
                        <a 
                          href={project.websiteUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-muted-foreground hover:text-primary"
                          aria-label={`Visit ${project.name} website`}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                    <p className="text-muted-foreground text-sm mb-1">
                      {project.description}
                    </p>
                  </div>
                </div>
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
