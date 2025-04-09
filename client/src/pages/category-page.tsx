import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { Project, Category } from "@shared/schema";
import ProjectCard from "@/components/project/project-card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, ArrowLeft } from "lucide-react";

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
          <h1 className="text-3xl font-bold">{formatCategoryName(category)}</h1>
          {categoryData && (
            <span className="ml-3 text-muted-foreground text-sm">{projects?.length || 0}</span>
          )}
        </div>
        
        {categoryDescription && (
          <p className="text-muted-foreground mb-6">{categoryDescription}</p>
        )}
        
        <div className="mt-4">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, index) => (
                <Skeleton key={index} className="h-24 w-full" />
              ))}
            </div>
          ) : projects && projects.length > 0 ? (
            <div className="space-y-4">
              {projects.map((project, index) => (
                <div key={project.id} className="flex">
                  <div className="w-8 text-center pt-2 font-medium text-muted-foreground">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <ProjectCard 
                      project={project} 
                      showVerificationIcon={project.approved}
                    />
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
