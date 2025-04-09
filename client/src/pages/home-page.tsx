
import React from 'react';
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Gift, Wallet, BarChart3, Compass, Drill, PenTool, PieChart, ArrowLeftRight, MessageSquare } from "lucide-react";

const categories = [
  { id: "airdrop", name: "Airdrop", icon: <Gift className="h-6 w-6" /> },
  { id: "wallets", name: "Wallets", icon: <Wallet className="h-6 w-6" /> },
  { id: "exchanges", name: "Exchanges DEX", icon: <BarChart3 className="h-6 w-6" /> },
  { id: "explorers", name: "Explorers", icon: <Compass className="h-6 w-6" /> },
  { id: "utilities", name: "Utilities", icon: <Drill className="h-6 w-6" /> },
  { id: "nft", name: "NFT Services", icon: <PenTool className="h-6 w-6" /> },
  { id: "staking", name: "Staking", icon: <PieChart className="h-6 w-6" /> },
  { id: "bridges", name: "Bridges", icon: <ArrowLeftRight className="h-6 w-6" /> },
  { id: "channels", name: "Channels", icon: <MessageSquare className="h-6 w-6" /> }
];

const CategorySection = () => {
  return (
    <ScrollArea className="w-full whitespace-nowrap rounded-md border">
      <div className="flex w-max space-x-4 p-4">
        {categories.map((category) => (
          <Link key={category.id} href={`/category/${category.id}`}>
            <Card className="inline-flex h-32 w-48 cursor-pointer flex-col items-center justify-center space-y-2 p-4 transition-colors hover:bg-accent">
              {category.icon}
              <span className="font-medium">{category.name}</span>
            </Card>
          </Link>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};

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
