import React, { useState, useEffect } from 'react';
import { Exercise } from './RehabPlanDisplay';
// Removed incorrect import: import { ProgressLogData } from './ProgressHistory';
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter, 
  DialogClose 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { 
  AlertCircle, Save, X, ActivitySquare, Dumbbell, 
  Clock, ThumbsUp, AlertTriangle 
} from 'lucide-react';

// Define type for data being saved (matches backend ProgressEntryBase)
// Define it here since it was moved during refactoring
interface ProgressLogData {
  exercise_id: string;
  completed_sets?: number | null;
  completed_reps?: number | null;
  duration_seconds?: number | null;
  pain_level?: number | null;
  difficulty_level?: number | null;
  notes?: string | null;
}

interface ProgressLoggerProps {
  exercise: Exercise | null;
  isOpen: boolean; // Control visibility via prop
  onClose: () => void;
  onSave: (logData: ProgressLogData) => Promise<void>;
}

const ProgressLogger: React.FC<ProgressLoggerProps> = ({ 
  exercise, 
  isOpen,
  onClose, 
  onSave 
}) => {
  const [sets, setSets] = useState<string>('');
  const [reps, setReps] = useState<string>('');
  const [duration, setDuration] = useState<string>('');
  // Use number[] for Shadcn slider value
  const [pain, setPain] = useState<number[]>([0]);
  const [difficulty, setDifficulty] = useState<number[]>([0]);
  const [notes, setNotes] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (exercise) {
      setSets(exercise.sets?.toString() ?? '');
      setReps(exercise.reps?.toString() ?? '');
      setDuration(exercise.duration_seconds?.toString() ?? '');
      // Reset sliders and notes when opening
      setPain([0]);
      setDifficulty([0]);
      setNotes('');
      setError(null);
      setIsSaving(false);
    } 
  }, [exercise, isOpen]); // Re-run when isOpen changes too, to reset fields

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!exercise) return;
    
    setIsSaving(true);
    setError(null);

    const logData: ProgressLogData = {
      exercise_id: exercise.id,
      completed_sets: sets ? parseInt(sets, 10) : null,
      completed_reps: reps ? parseInt(reps, 10) : null,
      duration_seconds: duration ? parseInt(duration, 10) : null,
      pain_level: pain[0], // Get value from slider array
      difficulty_level: difficulty[0], // Get value from slider array
      notes: notes.trim() || null,
    };

    try {
      await onSave(logData);
      onClose(); // Close dialog on successful save
    } catch (err) {
      console.error("Error saving progress:", err);
      setError(err instanceof Error ? err.message : "Failed to save progress.");
    } finally {
      setIsSaving(false);
    }
  };

  // Helper function to get color based on pain level
  const getPainLevelColor = (level: number) => {
    if (level <= 3) return "text-green-500";
    if (level <= 6) return "text-amber-500";
    return "text-red-500";
  };

  // Helper to get progress bar color class
  const getProgressBarColor = (value: number, max: number) => {
    const percentage = (value / max) * 100;
    if (percentage <= 30) return "bg-green-500";
    if (percentage <= 70) return "bg-amber-500";
    return "bg-red-500";
  };

  // Use Shadcn Dialog - controlled by isOpen prop
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}> 
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-border p-6">
          <DialogHeader className="mb-2">
            <DialogTitle className="text-xl flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-primary" />
              <span>{exercise?.name || 'Exercise'}</span>
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {exercise?.description || 'Record your performance and how you felt during this exercise.'}
            </DialogDescription>
          </DialogHeader>

          {exercise?.instructions && (
            <div className="mt-2 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800/50 text-sm text-amber-800 dark:text-amber-300 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <p>{exercise.instructions}</p>
            </div>
          )}
        </div>
        
        <form onSubmit={handleSave} className="p-6 space-y-6">
          {/* Performance Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
              <ActivitySquare className="h-4 w-4" />
              <span>PERFORMANCE</span>
            </h3>
            
            {(exercise?.sets || exercise?.reps) && (
              <div className="grid grid-cols-2 gap-4">
                {exercise?.sets && (
                  <div className="space-y-2">
                    <Label htmlFor="sets" className="flex items-center gap-1.5">
                      <span>Completed Sets</span>
                      <span className="text-xs text-muted-foreground">
                        (Target: {exercise.sets})
                      </span>
                    </Label>
                    <Input 
                      id="sets" 
                      type="number" 
                      value={sets}
                      onChange={(e) => setSets(e.target.value)} 
                      placeholder={exercise.sets?.toString() ?? "Sets"}
                      disabled={isSaving}
                      className="border-primary/20 focus:border-primary/40"
                    />
                  </div>
                )}
                
                {exercise?.reps && (
                  <div className="space-y-2">
                    <Label htmlFor="reps" className="flex items-center gap-1.5">
                      <span>Completed Reps</span>
                      <span className="text-xs text-muted-foreground">
                        (Target: {exercise.reps})
                      </span>
                    </Label>
                    <Input 
                      id="reps" 
                      type="number" 
                      value={reps}
                      onChange={(e) => setReps(e.target.value)} 
                      placeholder={exercise.reps?.toString() ?? "Reps"}
                      disabled={isSaving}
                      className="border-primary/20 focus:border-primary/40"
                    />
                  </div>
                )}
              </div>
            )}
            
            {exercise?.duration_seconds && (
              <div className="space-y-2">
                <Label htmlFor="duration" className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Duration (seconds)</span>
                  <span className="text-xs text-muted-foreground">
                    (Target: {exercise.duration_seconds}s)
                  </span>
                </Label>
                <Input 
                  id="duration" 
                  type="number" 
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)} 
                  placeholder={exercise.duration_seconds?.toString() ?? "Seconds"}
                  disabled={isSaving}
                  className="border-primary/20 focus:border-primary/40"
                />
              </div>
            )}
          </div>

          {/* Feedback Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
              <ThumbsUp className="h-4 w-4" />
              <span>YOUR FEEDBACK</span>
            </h3>
            
            <div className="space-y-2">
              <Label className="flex items-center justify-between">
                <span>Pain Level: <span className={getPainLevelColor(pain[0])}>{pain[0]}/10</span></span>
                {pain[0] > 7 && (
                  <span className="text-xs text-red-500 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    High pain - consider contacting your therapist
                  </span>
                )}
              </Label>
              <div className="px-1">
                <Slider 
                  id="pain"
                  min={0} 
                  max={10} 
                  step={1} 
                  value={pain} 
                  onValueChange={setPain} 
                  disabled={isSaving}
                  className="py-4"
                />
                <div className="flex justify-between text-xs text-muted-foreground -mt-1">
                  <span>No Pain</span>
                  <span>Moderate</span>
                  <span>Severe</span>
                </div>
                <div className="h-2 mt-2 w-full bg-muted/50 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all ${getProgressBarColor(pain[0], 10)}`}
                    style={{ width: `${pain[0] * 10}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex justify-between">
                <span>Difficulty Level: <span className={getPainLevelColor(difficulty[0])}>{difficulty[0]}/10</span></span>
              </Label>
              <div className="px-1">
                <Slider 
                  id="difficulty"
                  min={0} 
                  max={10} 
                  step={1} 
                  value={difficulty} 
                  onValueChange={setDifficulty} 
                  disabled={isSaving}
                  className="py-4"
                />
                <div className="flex justify-between text-xs text-muted-foreground -mt-1">
                  <span>Easy</span>
                  <span>Moderate</span>
                  <span>Hard</span>
                </div>
                <div className="h-2 mt-2 w-full bg-muted/50 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all ${getProgressBarColor(difficulty[0], 10)}`}
                    style={{ width: `${difficulty[0] * 10}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea 
              id="notes" 
              value={notes}
              onChange={(e) => setNotes(e.target.value)} 
              placeholder="How did you feel? Any issues or improvements?"
              disabled={isSaving}
              className="resize-none min-h-24"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800/50 text-sm text-red-600 dark:text-red-300 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}
        
          <DialogFooter className="flex gap-2 pt-2">
            <DialogClose asChild>
              <Button 
                type="button" 
                variant="outline" 
                disabled={isSaving}
                className="flex items-center gap-1"
              >
                <X className="h-4 w-4" />
                <span>Cancel</span>
              </Button>
            </DialogClose>
            <Button 
              type="submit" 
              disabled={isSaving}
              className="flex items-center gap-1 bg-primary text-primary-foreground"
            >
              {isSaving ? (
                <>
                  <div className="h-4 w-4 border-2 border-t-transparent border-primary-foreground rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save Progress</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProgressLogger;
export type { ProgressLogData }; // Export for page.tsx 