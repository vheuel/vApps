import { useParams } from "wouter";
import { JournalDetail } from "@/components/journal/journal-detail";

export default function JournalDetailPage() {
  const params = useParams<{ id: string }>();
  const journalId = params?.id ? parseInt(params.id) : 0;

  if (!journalId) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <h1 className="text-3xl font-bold text-destructive">Invalid Post ID</h1>
        <p className="text-muted-foreground mt-2">
          The post you're looking for could not be found.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <JournalDetail journalId={journalId} />
    </div>
  );
}