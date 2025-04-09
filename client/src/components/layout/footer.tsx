import { Link } from "wouter";
import { Github, Twitter, Facebook, Instagram } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { SiteSettings } from "@shared/schema";

export default function Footer() {
  // Get site settings
  const { data: siteSettings } = useQuery<SiteSettings>({
    queryKey: ["/api/site-settings"],
  });
  return (
    <footer className="bg-background border-t border-border/40 py-8 px-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <h3 className="font-bold text-lg">{siteSettings?.siteName || "vApps by Vheüel"}</h3>
            <p className="text-muted-foreground max-w-xs">
              {siteSettings?.siteDescription || "The cutting-edge Web3 project discovery platform connecting blockchain innovators through an intelligent, community-driven ecosystem."}
            </p>
            <div className="flex space-x-4 mt-4">
              <a 
                href="https://github.com" 
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="GitHub"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="h-5 w-5" />
              </a>
              <a 
                href="https://twitter.com" 
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Twitter"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a 
                href="https://facebook.com" 
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Facebook"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a 
                href="https://instagram.com" 
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Instagram"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Resources</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/docs" 
                  className="text-muted-foreground hover:text-primary"
                >
                  Documentation
                </Link>
              </li>
              <li>
                <a 
                  href="mailto:privacy@vheuel.com" 
                  className="text-muted-foreground hover:text-primary"
                >
                  Privacy Email
                </a>
              </li>
              <li>
                <a 
                  href="mailto:support@vheuel.com" 
                  className="text-muted-foreground hover:text-primary"
                >
                  Support
                </a>
              </li>
              <li>
                <Link 
                  href="/" 
                  className="text-muted-foreground hover:text-primary"
                >
                  Community
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Categories</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/category/airdrop" className="text-muted-foreground hover:text-primary">
                  Airdrop
                </Link>
              </li>
              <li>
                <Link href="/category/wallets" className="text-muted-foreground hover:text-primary">
                  Wallets
                </Link>
              </li>
              <li>
                <Link href="/category/exchanges" className="text-muted-foreground hover:text-primary">
                  Exchanges DEX
                </Link>
              </li>
              <li>
                <Link href="/" className="text-muted-foreground hover:text-primary">
                  All Categories
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/terms" 
                  className="text-muted-foreground hover:text-primary"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy" 
                  className="text-muted-foreground hover:text-primary"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/cookies" 
                  className="text-muted-foreground hover:text-primary"
                >
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/40 mt-8 pt-6 text-center text-sm text-muted-foreground">
          <p>{siteSettings?.footerText || "© 2025 vApps by Vheüel. All rights reserved."}</p>
        </div>
      </div>
    </footer>
  );
}
