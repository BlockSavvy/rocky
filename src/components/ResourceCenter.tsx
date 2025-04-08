import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  // Add onSelectResource callback later if needed for viewing content
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
    <Card className="flex flex-col h-full"> 
      <CardHeader>
        <CardTitle className="text-lg">Resource Center</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden">
        {resources.length === 0 ? (
          <p className="text-sm text-muted-foreground">No resources available yet.</p>
        ) : (
          <ScrollArea className="h-full pr-3"> {/* Use full height */} 
            <ul className="space-y-2">
              {[...resources].sort((a, b) => new Date(b.added_date).getTime() - new Date(a.added_date).getTime()).map((resource) => ( // Show newest first
                <li 
                    key={resource.id} 
                    className="p-3 border border-border rounded-md bg-background text-sm hover:bg-accent cursor-pointer transition-colors" 
                    // onClick={() => onSelectResource(resource.id)} // Add later for viewing
                >
                  <p className="font-medium text-foreground mb-1 truncate" title={resource.title}>
                    {resource.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Type: {resource.type} | Added: {new Date(resource.added_date).toLocaleDateString()}
                  </p>
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