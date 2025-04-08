import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

// Define interfaces matching backend Pydantic models
interface Exercise {
  id: string;
  name: string;
  description?: string | null;
  sets?: number | null;
  reps?: number | null;
  duration_seconds?: number | null;
  instructions?: string | null;
}

interface RehabPlan {
  id: string;
  name: string;
  start_date: string; // Assuming string for simplicity from JSON
  goal?: string | null;
  exercises: Exercise[];
}

interface RehabPlanDisplayProps {
  plan: RehabPlan | null;
  isLoading: boolean;
  error: string | null;
  onLogProgressClick: (exerciseId: string) => void; // Callback to open logger
}

const RehabPlanDisplay: React.FC<RehabPlanDisplayProps> = ({ 
  plan,
  isLoading,
  error,
  onLogProgressClick
}) => {
  if (isLoading) {
    return (
        <Card className="animate-pulse">
            <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </CardContent>
        </Card>
    );
  }

  if (error) {
    return (
        <Card className="border-destructive bg-red-50">
            <CardHeader>
                <CardTitle className="text-destructive">Error Loading Plan</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-destructive-foreground">{error}</p>
            </CardContent>
        </Card>
    );
  }

  if (!plan) {
    return (
        <Card>
             <CardHeader>
                <CardTitle>Rehabilitation Plan</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">No plan assigned yet.</p>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle className="text-xl">Rehab: {plan.name}</CardTitle>
        <CardDescription>
          Started: {new Date(plan.start_date).toLocaleDateString()} | Goal: {plan.goal || 'Not specified'}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden">
         <h4 className="text-md font-medium mb-3 text-foreground">Exercises</h4>
         <ScrollArea className="h-[calc(100%-40px)] pr-4">
            {plan.exercises.length > 0 ? (
            <ul className="space-y-3">
                {plan.exercises.map((ex) => (
                <li key={ex.id} className="border border-border rounded-md p-4 hover:bg-accent hover:text-accent-foreground transition-colors">
                    <div className="flex justify-between items-start gap-3">
                        <div className="flex-1">
                            <h5 className="font-semibold text-primary">{ex.name}</h5>
                            {ex.description && <p className="text-sm text-muted-foreground mt-1">{ex.description}</p>}
                            <div className="text-sm text-muted-foreground mt-2 space-x-3">
                                {ex.sets && <span>Sets: {ex.sets}</span>}
                                {ex.reps && <span>Reps: {ex.reps}</span>}
                                {ex.duration_seconds && <span>Duration: {ex.duration_seconds}s</span>}
                            </div>
                            {ex.instructions && <p className="text-xs text-amber-700 dark:text-amber-400 mt-2 bg-amber-50 dark:bg-amber-900/30 p-2 rounded border border-amber-200 dark:border-amber-800">Note: {ex.instructions}</p>}
                        </div>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => onLogProgressClick(ex.id)}
                            className="mt-1 whitespace-nowrap"
                        >
                            Log
                        </Button>
                    </div>
                </li>
                ))}
            </ul>
            ) : (
            <p className="text-sm text-muted-foreground">No exercises assigned yet.</p>
            )}
         </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default RehabPlanDisplay;
export type { Exercise, RehabPlan }; // Export types for use in page.tsx 