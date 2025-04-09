import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Eye } from "lucide-react";

// Interface untuk aset portfolio
interface Asset {
  id: string;
  name: string;
  symbol: string;
  balance: number;
  value: number;
  price: number;
  changePercent: number;
  iconUrl?: string;
}

// Interface untuk statistik portfolio
interface PortfolioStats {
  totalValue: number;
  tokensPercent: number;
  nftsPercent: number;
  defiPercent: number;
}

// Dummy data untuk demo
const mockAssets: Asset[] = [
  {
    id: "eth",
    name: "Ethereum",
    symbol: "ETH",
    balance: 0.00008,
    value: 0.15,
    price: 1895.10,
    changePercent: -2.20,
    iconUrl: "https://cryptologos.cc/logos/ethereum-eth-logo.png"
  },
  {
    id: "gmee",
    name: "GMEE",
    symbol: "GMEE",
    balance: 74.47338,
    value: 0.01,
    price: 0.00013,
    changePercent: 0,
    iconUrl: ""
  },
  {
    id: "dai",
    name: "Dai",
    symbol: "DAI",
    balance: 0.00008,
    value: 0.00,
    price: 1.00,
    changePercent: 0.01,
    iconUrl: "https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png"
  }
];

const mockStats: PortfolioStats = {
  totalValue: 0.89,
  tokensPercent: 18.29,
  nftsPercent: 27.68,
  defiPercent: 54.03
};

export default function PortfolioTab() {
  const [assets, setAssets] = useState<Asset[]>(mockAssets);
  const [stats, setStats] = useState<PortfolioStats>(mockStats);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showBalance, setShowBalance] = useState(true);

  // Simulasi refresh data
  const refreshPortfolio = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      // Pada implementasi nyata, ini akan memanggil API untuk data terbaru
      setIsRefreshing(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Portfolio Overview Card */}
      <Card className="bg-gray-50">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <h3 className="text-lg font-medium">Total Asset</h3>
              <button 
                onClick={() => setShowBalance(!showBalance)}
                className="ml-2"
              >
                <Eye className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <button 
              onClick={refreshPortfolio}
              className="rounded-full bg-green-500 p-3 text-white"
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
          
          {/* Balance Display */}
          <div className="mb-6">
            <h2 className="text-4xl font-bold">
              {showBalance ? `$${stats.totalValue.toFixed(2)}` : '•••••'}
            </h2>
          </div>
          
          {/* Asset Distribution */}
          <div className="flex space-x-4">
            <div className="flex items-center">
              <span className="h-3 w-3 rounded-full bg-green-500 mr-2"></span>
              <span className="text-sm text-gray-600">{stats.tokensPercent}% Tokens</span>
            </div>
            <div className="flex items-center">
              <span className="h-3 w-3 rounded-full bg-blue-500 mr-2"></span>
              <span className="text-sm text-gray-600">{stats.nftsPercent}% NFTs</span>
            </div>
            <div className="flex items-center">
              <span className="h-3 w-3 rounded-full bg-orange-500 mr-2"></span>
              <span className="text-sm text-gray-600">{stats.defiPercent}% DeFi</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Token List */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Token</h3>
          <div className="flex items-center">
            <span className="text-xl font-bold mr-1">$0.16</span>
            <span className="text-gray-400">→</span>
          </div>
        </div>
        
        <div className="space-y-4">
          {assets.map((asset) => (
            <div 
              key={asset.id}
              className="flex justify-between items-center p-2"
            >
              <div className="flex items-center">
                <Avatar className="h-10 w-10 mr-4">
                  {asset.iconUrl ? (
                    <AvatarImage src={asset.iconUrl} />
                  ) : (
                    <AvatarFallback className="bg-gray-200 text-xs">
                      {asset.symbol}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <div className="font-bold">{asset.symbol}</div>
                  <div className="flex items-center">
                    <div className="text-gray-500">{asset.price.toLocaleString('en-US', {
                      minimumFractionDigits: asset.price < 0.1 ? 5 : 2,
                      maximumFractionDigits: asset.price < 0.1 ? 5 : 2
                    })}</div>
                    <Badge 
                      className={`ml-2 ${asset.changePercent >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                      variant="outline"
                    >
                      {asset.changePercent >= 0 ? '+' : ''}{asset.changePercent.toFixed(2)}%
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold">{asset.balance.toLocaleString('en-US', {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: asset.balance < 0.1 ? 5 : 2
                })}</div>
                <div className="text-gray-500">${asset.value.toFixed(2)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}