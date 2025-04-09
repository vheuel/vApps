import { Link } from "wouter";
import { Github, Twitter, Facebook, Instagram } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-background border-t border-border/40 py-8 px-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <h3 className="font-bold text-lg">EARN App</h3>
            <p className="text-muted-foreground max-w-xs">
              The community-driven catalog for web3 applications and services.
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
                <a 
                  href="#" 
                  className="text-muted-foreground hover:text-primary"
                >
                  Documentation
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-muted-foreground hover:text-primary"
                >
                  API
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-muted-foreground hover:text-primary"
                >
                  Support
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-muted-foreground hover:text-primary"
                >
                  Community
                </a>
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
                <a 
                  href="#" 
                  className="text-muted-foreground hover:text-primary"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-muted-foreground hover:text-primary"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-muted-foreground hover:text-primary"
                >
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/40 mt-8 pt-6 text-center text-sm text-muted-foreground">
          <p>© 2025 EARN App. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
