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

  // Use Shadcn Dialog - controlled by isOpen prop
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}> 
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Log Progress: {exercise?.name || 'Exercise'}</DialogTitle>
          <DialogDescription>
            Record your performance and how you felt during this exercise.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSave} className="grid gap-4 py-4">
          {(exercise?.sets || exercise?.reps) && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sets">Completed Sets</Label>
                <Input 
                  id="sets" 
                  type="number" 
                  value={sets}
                  onChange={(e) => setSets(e.target.value)} 
                  placeholder={exercise?.sets?.toString() ?? "Sets"}
                  disabled={isSaving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reps">Completed Reps</Label>
                <Input 
                  id="reps" 
                  type="number" 
                  value={reps}
                  onChange={(e) => setReps(e.target.value)} 
                  placeholder={exercise?.reps?.toString() ?? "Reps"}
                   disabled={isSaving}
                />
              </div>
            </div>
          )}
          {exercise?.duration_seconds && (
              <div className="space-y-2">
                <Label htmlFor="duration">Completed Duration (seconds)</Label>
                <Input 
                  id="duration" 
                  type="number" 
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)} 
                  placeholder={exercise.duration_seconds?.toString() ?? "Seconds"}
                  disabled={isSaving}
                />
              </div>
          )}

          <div className="space-y-2">
             <Label htmlFor="pain">Pain Level: {pain[0]}/10</Label>
             <Slider 
               id="pain"
               min={0} 
               max={10} 
               step={1} 
               value={pain} 
               onValueChange={setPain} 
               disabled={isSaving}
               className="py-2"
             />
          </div>
          <div className="space-y-2">
             <Label htmlFor="difficulty">Difficulty Level: {difficulty[0]}/10</Label>
             <Slider 
               id="difficulty"
               min={0} 
               max={10} 
               step={1} 
               value={difficulty} 
               onValueChange={setDifficulty} 
               disabled={isSaving}
               className="py-2"
             />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea 
              id="notes" 
              value={notes}
              onChange={(e) => setNotes(e.target.value)} 
              placeholder="Any observations, feelings, etc."
              disabled={isSaving}
            />
          </div>

          {error && <p className="text-sm text-destructive">Error: {error}</p>}
        
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isSaving}>Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Progress'}
            </Button>
          </DialogFooter>
         </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProgressLogger;
export type { ProgressLogData }; // Export for page.tsx 