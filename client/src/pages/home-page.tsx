
import { useState, useRef } from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../hooks/use-auth';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';

// Removed duplicate function

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      return response.json();
    }
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['projects', selectedCategory],
    queryFn: async () => {
      const url = selectedCategory 
        ? `/api/projects/category/${selectedCategory}`  
        : '/api/projects';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch projects');
      return response.json();
    }
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Welcome to EARN App</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Discover and share the best Web3 projects
        </p>
        {!isAuthenticated && (
          <div className="flex justify-center gap-4">
            <Button asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/register">Register</Link>
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
        {categories.map((category) => (
          <Card 
            key={category.id} 
            className={`p-6 cursor-pointer transition-all ${
              selectedCategory === category.slug ? 'border-primary' : ''
            }`}
            onClick={() => setSelectedCategory(
              selectedCategory === category.slug ? null : category.slug
            )}
          >
            <div className="text-4xl mb-4">
              {getCategoryIcon(category.name)}
            </div>
            <h3 className="text-lg font-semibold">{category.name}</h3>
            <p className="text-sm text-muted-foreground">{category.description}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card key={project.id} className="p-6">
            <h3 className="text-xl font-semibold mb-2">{project.name}</h3>
            <p className="text-muted-foreground mb-4">{project.description}</p>
            <div className="flex justify-between items-center">
              <Link href={`/projects/${project.id}`}>
                <Button variant="outline">Learn More</Button>
              </Link>
              {project.verified && (
                <span className="text-green-500">✓ Verified</span>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
