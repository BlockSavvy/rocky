import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { LogIn, Award, HelpCircle, Clock, CheckCircle2, BarChart3 } from 'lucide-react';
import { Progress } from "@/components/ui/progress";

// Define interfaces matching backend Pydantic models
export interface Exercise {
  id: string;
  name: string;
  description?: string | null;
  sets?: number | null;
  reps?: number | null;
  duration_seconds?: number | null;
  instructions?: string | null;
}

export interface RehabPlan {
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
      <div className="space-y-4">
        <div className="h-6 bg-muted rounded w-3/4 animate-pulse"></div>
        <div className="space-y-3">
          <div className="border rounded-lg p-5 space-y-3 animate-pulse">
            <div className="h-5 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-full"></div>
            <div className="h-4 bg-muted rounded w-5/6"></div>
          </div>
          <div className="border rounded-lg p-5 space-y-3 animate-pulse">
            <div className="h-5 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-full"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive bg-destructive/10">
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
      <div className="flex flex-col items-center justify-center space-y-4 py-12 text-center">
        <div className="rounded-full bg-primary/10 p-3">
          <Award className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-xl font-medium">No Rehab Plan Yet</h3>
        <p className="text-sm text-muted-foreground max-w-md">
          You don&apos;t have a rehabilitation plan assigned yet. Once assigned, your exercises and progress tracking will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="relative pl-4 border-l-4 border-primary/70 mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{plan.name}</h1>
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="mr-1 h-4 w-4" />
            <span>Started {new Date(plan.start_date).toLocaleDateString()}</span>
          </div>
        </div>
        
        {plan.goal && (
          <div className="mt-2 rounded-lg bg-primary/5 p-4 text-sm border border-primary/20 relative overflow-hidden">
            <div className="relative z-10">
              <strong className="font-medium">Goal:</strong> {plan.goal}
            </div>
            <div className="absolute top-0 right-0 opacity-20 p-2 transform translate-x-1/3 -translate-y-1/3">
              <BarChart3 className="h-16 w-16 text-primary" />
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center">
            <CheckCircle2 className="h-5 w-5 text-primary mr-2" />
            Exercises
          </h2>
          <div className="flex items-center">
            <div className="w-20 mr-2">
              <Progress value={(3 / Math.max(1, plan.exercises.length)) * 100} className="h-2" />
            </div>
            <span className="text-sm text-muted-foreground">{plan.exercises.length} total</span>
          </div>
        </div>
        
        {plan.exercises.length > 0 ? (
          <div className="grid gap-4 pt-2">
            {plan.exercises.map((ex) => (
              <Card 
                key={ex.id} 
                className="exercise-card overflow-hidden transition-all hover:shadow-md"
              >
                <div className="relative">
                  {/* Decorative gradient bar */}
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary/60 via-primary to-primary/80"></div>
                  
                  <div className="p-5 relative z-10">
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1 space-y-3">
                        <div>
                          <h3 className="font-semibold text-lg text-primary">{ex.name}</h3>
                          {ex.description && <p className="text-sm text-muted-foreground">{ex.description}</p>}
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          {ex.sets && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="rounded bg-primary/10 px-2.5 py-1.5 text-center border border-primary/20 hover:bg-primary/15 transition-colors">
                                  <div className="text-sm font-medium">{ex.sets}</div>
                                  <div className="text-xs text-muted-foreground">Sets</div>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Perform {ex.sets} sets of this exercise</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                          
                          {ex.reps && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="rounded bg-primary/10 px-2.5 py-1.5 text-center border border-primary/20 hover:bg-primary/15 transition-colors">
                                  <div className="text-sm font-medium">{ex.reps}</div>
                                  <div className="text-xs text-muted-foreground">Reps</div>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Do {ex.reps} repetitions per set</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                          
                          {ex.duration_seconds && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="rounded bg-primary/10 px-2.5 py-1.5 text-center border border-primary/20 hover:bg-primary/15 transition-colors">
                                  <div className="text-sm font-medium">{ex.duration_seconds}s</div>
                                  <div className="text-xs text-muted-foreground">Duration</div>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Hold or perform for {ex.duration_seconds} seconds</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                        
                        {ex.instructions && (
                          <div className="rounded-md bg-amber-50 dark:bg-amber-950/30 p-3 border border-amber-200 dark:border-amber-800/50 relative overflow-hidden">
                            <div className="flex gap-2 relative z-10">
                              <HelpCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                              <p className="text-sm text-amber-800 dark:text-amber-300">{ex.instructions}</p>
                            </div>
                            <div className="absolute -right-2 -bottom-2 opacity-5">
                              <HelpCircle className="h-16 w-16" />
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => onLogProgressClick(ex.id)}
                        className="btn-primary text-primary-foreground whitespace-nowrap shadow-md hover:shadow-lg transition-all"
                        aria-label={`Log progress for ${ex.name}`}
                      >
                        <LogIn className="h-4 w-4 mr-1.5" />
                        <span>Log Progress</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground py-4 text-center">No exercises assigned yet.</p>
        )}
      </div>
    </div>
  );
};

export default RehabPlanDisplay; 