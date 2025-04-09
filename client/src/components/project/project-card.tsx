import { Project } from "@shared/schema";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { Globe } from "lucide-react";

interface ProjectCardProps {
  project: Project;
  showActions?: boolean;
  onEdit?: (project: Project) => void;
}

export default function ProjectCard({ project, showActions = false, onEdit }: ProjectCardProps) {
  const createdAt = project.createdAt ? new Date(project.createdAt) : new Date();

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        <div className="p-4">
          <div className="flex items-start">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
              {project.iconUrl ? (
                <img 
                  src={project.iconUrl} 
                  alt={project.name} 
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
              )}
            </div>
            <div className="ml-4 flex-1">
              <h3 className="font-medium text-lg">{project.name}</h3>
              <p className="text-muted-foreground text-sm line-clamp-2">{project.description}</p>
              
              <div className="mt-1 flex items-center text-sm">
                <span className="text-primary">
                  Kategori: {project.category.charAt(0).toUpperCase() + project.category.slice(1)}
                </span>
              </div>
              
              {project.websiteUrl && (
                <div className="flex items-center mt-1">
                  <Globe className="h-3 w-3 text-muted-foreground mr-1" />
                  <a 
                    href={project.websiteUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-primary text-sm hover:underline"
                  >
                    {new URL(project.websiteUrl).hostname}
                  </a>
                </div>
              )}

              {showActions && (
                <div className="mt-3 flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    Added {formatDistanceToNow(createdAt, { addSuffix: true })}
                  </span>
                  <div className="space-x-2">
                    {onEdit && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => onEdit(project)}
                      >
                        Edit
                      </Button>
                    )}
                    {project.websiteUrl && (
                      <Button
                        variant="default"
                        size="sm"
                        asChild
                      >
                        <a 
                          href={project.websiteUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          Visit
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
