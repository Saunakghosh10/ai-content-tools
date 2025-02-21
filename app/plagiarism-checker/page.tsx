import PlagiarismCheckerForm from "@/components/PlagiarismCheckerForm";
import { FileSearch } from 'lucide-react';
import { ModeToggle } from "@/components/mode-toggle";

export default function PlagiarismCheckerPage() {
  return (
    <div className="container mx-auto">
      <div className="min-h-screen p-8 pb-20 sm:p-20 bg-background">
        <div className="absolute top-4 right-4">
          <ModeToggle />
        </div>
        <main className="flex flex-col gap-8 items-center sm:items-start w-full max-w-3xl mx-auto">
          <div className="flex items-center gap-3 w-full">
            <FileSearch className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">
              Plagiarism Checker
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Check content originality, get similarity scores, and find source citations
          </p>
          <PlagiarismCheckerForm />
        </main>
      </div>
    </div>
  );
} 