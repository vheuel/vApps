import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Gift, Wallet, BarChart3, Compass, Drill, PenTool, PieChart, ArrowLeftRight, MessageSquare } from "lucide-react";

interface CategoryTab {
  id: string;
  name: string;
  icon: React.ReactNode;
}

const categories: CategoryTab[] = [
  { id: "airdrop", name: "Airdrop", icon: <Gift className="h-4 w-4 mr-2" /> },
  { id: "wallets", name: "Wallets", icon: <Wallet className="h-4 w-4 mr-2" /> },
  { id: "exchanges", name: "Exchanges DEX", icon: <BarChart3 className="h-4 w-4 mr-2" /> },
  { id: "explorers", name: "Explorers", icon: <Compass className="h-4 w-4 mr-2" /> },
  { id: "utilities", name: "Utilities", icon: <Drill className="h-4 w-4 mr-2" /> },
  { id: "nft", name: "NFT Services", icon: <PenTool className="h-4 w-4 mr-2" /> },
  { id: "staking", name: "Staking", icon: <PieChart className="h-4 w-4 mr-2" /> },
  { id: "bridges", name: "Bridges", icon: <ArrowLeftRight className="h-4 w-4 mr-2" /> },
  { id: "channels", name: "Channels", icon: <MessageSquare className="h-4 w-4 mr-2" /> },
];

export default function CategoryTabs() {
  const [location] = useLocation();
  const currentCategory = location.split("/")[2] || "";

  return (
    <div className="border-b border-border/40 overflow-x-auto">
      <div className="flex tabs-responsive">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/category/${category.id}`}
            className={cn(
              "flex items-center px-4 py-3 text-sm font-medium whitespace-nowrap",
              category.id === currentCategory
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/10"
            )}
          >
            {category.icon}
            {category.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
