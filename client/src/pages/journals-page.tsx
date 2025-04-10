import { useState } from "react";
import { Button } from "@/components/ui/button";
import { JournalList } from "@/components/journal/journal-list";
import { JournalForm } from "@/components/journal/journal-form"; 
import { useAuth } from "@/hooks/use-auth";
import { Plus } from "lucide-react";
import { Journal } from "@shared/schema";

export default function JournalsPage() {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingJournal, setEditingJournal] = useState<Journal | null>(null);

  const handleEditJournal = (journal: Journal) => {
    setEditingJournal(journal);
    setShowForm(true);
  };

  const handleFormCancel = () => {
    setEditingJournal(null);
    setShowForm(false);
  };

  const handleFormSuccess = () => {
    setEditingJournal(null);
    setShowForm(false);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Community Journals</h1>
          <p className="text-muted-foreground mt-2">
            Discover insights and stories from the community
          </p>
        </div>
        
        {user && (
          <Button 
            onClick={() => {
              setEditingJournal(null);
              setShowForm(!showForm);
            }}
          >
            {showForm ? "Cancel" : (
              <>
                <Plus className="mr-2 h-4 w-4" /> 
                Write Journal
              </>
            )}
          </Button>
        )}
      </div>

      {showForm && user && (
        <div className="mb-8">
          <JournalForm 
            initialData={editingJournal || undefined}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-8">
        <div>
          <JournalList 
            showAdminOptions={user?.isAdmin}
            onEdit={handleEditJournal}
          />
        </div>
      </div>
    </div>
  );
}