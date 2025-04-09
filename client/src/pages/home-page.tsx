import React, { useRef } from 'react';
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { BookOpen, Building2, Compass, Globe2, Wallet } from "lucide-react";

const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'education':
      return <BookOpen className="h-6 w-6" />;
    case 'business':
      return <Building2 className="h-6 w-6" />;
    case 'travel':
      return <Compass className="h-6 w-6" />;
    case 'finance':
      return <Wallet className="h-6 w-6" />;
    default:
      return <Globe2 className="h-6 w-6" />;
  }
};

import { useRef } from 'react';

function getCategoryIcon(category: string) {
  switch (category.toLowerCase()) {
    case 'defi': return '💰';
    case 'gaming': return '🎮';
    case 'nft': return '🎨';
    case 'social': return '👥';
    case 'tools': return '🛠️';
    default: return '📱';
  }
}

const CategorySection = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <ScrollArea className="w-full whitespace-nowrap rounded-md border">
      <div className="flex w-max space-x-4 p-4">
        {['Education', 'Business', 'Travel', 'Finance'].map((category) => (
          <Link key={category} href={`/category/${category.toLowerCase()}`}>
            <Card className="inline-flex h-32 w-48 cursor-pointer flex-col items-center justify-center space-y-2 p-4 transition-colors hover:bg-accent">
              {getCategoryIcon(category)}
              <span className="font-medium">{category}</span>
            </Card>
          </Link>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};

import CategorySection from '@/components/category/category-section';

const HomePage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">Welcome to EARN App</h1>
          <p className="text-muted-foreground">Discover opportunities in the web3 space</p>
        </div>
        <div className="grid gap-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Browse Categories</h2>
            <CategorySection />
          </section>
        </div>
      </div>
    </div>
  );
};

export default HomePage;