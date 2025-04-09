
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { apiRequest } from '@/lib/queryClient';
import { Category } from '@shared/schema';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Box, Coins, Compass, Wallet, Star, Shapes, Target, Link as LinkIcon, MessageSquare } from 'lucide-react';

const getCategoryIcon = (category: string) => {
  const icons = {
    'airdrop': Coins,
    'wallet': Wallet,
    'exchanges-dex': Star,
    'explorers': Compass,
    'utilities': Box,
    'nft-services': Shapes,
    'staking': Target,
    'bridges': LinkIcon,
    'channels': MessageSquare,
  };
  
  const IconComponent = icons[category as keyof typeof icons] || AlertCircle;
  return <IconComponent className="h-6 w-6" />;
};

export default function CategorySection() {
  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/categories');
      return res.json();
    }
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(9)].map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {categories?.map((category) => (
        <Link key={category.id} href={`/category/${category.slug}`}>
          <Card className="cursor-pointer hover:bg-accent transition-colors">
            <CardContent className="flex items-center gap-4 p-4">
              {getCategoryIcon(category.slug)}
              <div>
                <h3 className="font-medium">{category.name}</h3>
                <p className="text-sm text-muted-foreground">{category.description}</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
