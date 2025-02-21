import MetaDescriptionForm from "@/components/MetaDescriptionForm";
import { FileText } from 'lucide-react';
import { ModeToggle } from "@/components/mode-toggle";

export default function MetaDescriptionPage() {
  return (
    <div className="container mx-auto">
      <div className="min-h-screen p-8 pb-20 sm:p-20 bg-background">
        <div className="absolute top-4 right-4">
          <ModeToggle />
        </div>
        <main className="flex flex-col gap-8 items-center sm:items-start w-full max-w-2xl mx-auto">
          <div className="flex items-center gap-3 w-full">
            <FileText className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">
              Meta Description Generator
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Generate SEO-optimized meta descriptions with AI assistance
          </p>
          <MetaDescriptionForm />
        </main>
      </div>
    </div>
  );
} 