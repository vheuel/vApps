import { Journal } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Calendar, User, Clock } from "lucide-react";
import { MdVerified } from "react-icons/md";

interface JournalDetailProps {
  journalId: number;
}

export function JournalDetail({ journalId }: JournalDetailProps) {
  const { data: journal, isLoading, error } = useQuery<Journal>({
    queryKey: [`/api/journals/${journalId}`],
    refetchOnWindowFocus: false,
  });

  // Get author details
  const { data: author, isLoading: isAuthorLoading } = useQuery<{ username: string, isAdmin: boolean, verified: boolean }>({
    queryKey: [`/api/user/${journal?.userId}`],
    enabled: !!journal?.userId,
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !journal) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-destructive">Failed to load post.</p>
          <Button 
            asChild 
            variant="outline" 
            className="mt-4"
          >
            <Link href="/journals">Back to Posts</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <article className="max-w-4xl mx-auto">
      <div className="mb-6">

        {journal.coverImage && (
          <div className="w-full h-64 md:h-96 overflow-hidden rounded-lg mb-6">
            <img 
              src={journal.coverImage} 
              alt={journal.title} 
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <h1 className="text-3xl font-bold">{journal.title}</h1>
        
        <div className="flex flex-wrap items-center mt-4 space-x-4 text-sm text-muted-foreground">
          <span className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            {new Date(journal.createdAt).toLocaleDateString()}
          </span>
          <span className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            {formatDistanceToNow(new Date(journal.createdAt)).replace(/^about\s/, '').replace(/\sago$/, '')}
          </span>
          {author ? (
            <span className="flex items-center">
              <User className="h-4 w-4 mr-1" />
              {author.username || "Unknown author"}
              {author.isAdmin && (
                <MdVerified className="h-4 w-4 text-amber-500 ml-1" title="Admin" />
              )}
              {!author.isAdmin && author.verified && (
                <MdVerified className="h-4 w-4 text-blue-500 ml-1" title="Verified User" />
              )}
            </span>
          ) : isAuthorLoading ? (
            <Skeleton className="h-4 w-24" />
          ) : null}
          
          {journal.featured && (
            <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-800/20 dark:text-amber-500">
              Featured
            </Badge>
          )}
        </div>
      </div>

      <div className="prose dark:prose-invert max-w-none">
        {/* Apply some simple formatting to the content by splitting paragraphs */}
        {journal.content.split("\n\n").map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>

      {/* Footer removed */}
    </article>
  );
}