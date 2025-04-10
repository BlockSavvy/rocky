import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// Define interface matching backend Pydantic ProgressEntry model
interface ProgressEntry {
  id: string;
  exercise_id: string; // We'll need the plan to map this to a name
  date: string; // ISO string format from backend
  completed_sets?: number | null;
  completed_reps?: number | null;
  duration_seconds?: number | null;
  pain_level?: number | null;
  difficulty_level?: number | null;
  notes?: string | null;
}

// We need the exercises from the plan to show the exercise name
interface Exercise {
  id: string;
  name: string;
}

interface ProgressHistoryProps {
  progressLog: ProgressEntry[];
  exercises: Exercise[]; // Pass exercises from the plan
  isLoading: boolean;
  error: string | null;
}

const ProgressHistory: React.FC<ProgressHistoryProps> = ({ 
  progressLog,
  exercises,
  isLoading,
  error
}) => {
  
  // Helper to find exercise name by ID
  const getExerciseName = (id: string): string => {
    const exercise = exercises.find(ex => ex.id === id);
    return exercise ? exercise.name : 'Unknown Exercise';
  };

  if (isLoading) {
    return (
        <Card className="animate-pulse mt-6">
            <CardHeader>
                 <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="h-10 bg-gray-200 rounded w-full"></div>
                <div className="h-10 bg-gray-200 rounded w-full"></div>
            </CardContent>
        </Card>
    );
  }

  if (error) {
     return (
        <Card className="border-destructive bg-red-50 mt-6">
            <CardHeader>
                <CardTitle className="text-destructive text-lg">Error Loading Progress</CardTitle>
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
        <CardTitle className="text-lg">Progress Log</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden p-0">
        {progressLog.length === 0 ? (
          <p className="text-sm text-muted-foreground px-1">No progress logged yet.</p>
        ) : (
          <ScrollArea className="h-full pr-1">
            <ul className="space-y-2">
              {[...progressLog].reverse().map((entry, index) => (
                <React.Fragment key={entry.id}>
                    <li className="p-3 rounded-md bg-muted/50 text-xs">
                      <p className="font-medium text-foreground mb-1 text-sm">
                        {getExerciseName(entry.exercise_id)}
                      </p>
                      <p className="text-xs text-muted-foreground mb-2">
                        {new Date(entry.date).toLocaleString()} 
                      </p>
                      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-muted-foreground mb-2">
                        {entry.completed_sets !== null && <span>Sets: <Badge variant="secondary">{entry.completed_sets}</Badge></span>}
                        {entry.completed_reps !== null && <span>Reps: <Badge variant="secondary">{entry.completed_reps}</Badge></span>}
                        {entry.duration_seconds !== null && <span>Duration: <Badge variant="secondary">{entry.duration_seconds}s</Badge></span>}
                        {entry.pain_level !== null && <span>Pain: <Badge variant={(entry.pain_level ?? 0) > 5 ? "destructive" : "outline"}>{entry.pain_level}/10</Badge></span>}
                        {entry.difficulty_level !== null && <span>Difficulty: <Badge variant="outline">{entry.difficulty_level}/10</Badge></span>}
                      </div>
                      {entry.notes && <p className="text-foreground text-xs mt-2 pt-2 border-t border-border/50">Notes: {entry.notes}</p>}
                    </li>
                    {index < progressLog.length - 1 && <Separator className="my-1" />}
                 </React.Fragment>
              ))}
            </ul>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default ProgressHistory;
export type { ProgressEntry }; // Export type for use in page.tsx 