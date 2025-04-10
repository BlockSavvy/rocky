import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Link as LinkIcon } from 'lucide-react'; // Import icons

// Define interface matching backend Resource model
interface Resource {
  id: string;
  title: string;
  content: string;
  type: string;
  source_url?: string | null;
  added_date: string; // ISO string
}

interface ResourceCenterProps {
  resources: Resource[];
  isLoading: boolean;
  error: string | null;
  // TODO: Add onSelectResource callback later
}

const ResourceCenter: React.FC<ResourceCenterProps> = ({ 
  resources,
  isLoading,
  error
}) => {

  if (isLoading) {
    return (
        <Card className="animate-pulse">
            <CardHeader>
                 <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="h-8 bg-gray-200 rounded w-full"></div>
                <div className="h-8 bg-gray-200 rounded w-full"></div>
            </CardContent>
        </Card>
    );
  }

  if (error) {
     return (
        <Card className="border-destructive bg-red-50">
            <CardHeader>
                <CardTitle className="text-destructive text-lg">Error Loading Resources</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-destructive-foreground">{error}</p>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card className="flex flex-col h-full border-0 shadow-none"> 
      <CardHeader className="pt-0 px-1 pb-3">
        <CardTitle className="text-lg">Resources</CardTitle> {/* Simplified Title */} 
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden p-0"> 
        {resources.length === 0 ? (
          <p className="text-sm text-muted-foreground px-1">No resources available yet.</p>
        ) : (
          <ScrollArea className="h-full pr-1"> 
            <ul className="space-y-2">
              {[...resources].sort((a, b) => new Date(b.added_date).getTime() - new Date(a.added_date).getTime()).map((resource) => (
                <li 
                    key={resource.id} 
                    className="flex items-center gap-3 p-3 border border-border rounded-md bg-background text-sm hover:bg-accent cursor-pointer transition-colors"
                    // onClick={() => onSelectResource(resource.id)} // Add later for viewing
                    title={`View ${resource.title}`}
                >
                  {/* Icon based on type */} 
                  {resource.type === 'link' ? 
                    <LinkIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" /> : 
                    <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  }
                  <div className="flex-1 overflow-hidden"> {/* Prevent text overflow */} 
                      <p className="font-medium text-foreground truncate">
                        {resource.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Type: {resource.type} | Added: {new Date(resource.added_date).toLocaleDateString()}
                      </p>
                  </div>
                  {/* Add a view/open button later? */}
                </li>
              ))}
            </ul>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default ResourceCenter;
export type { Resource }; // Export type 