'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import RehabPlanDisplay, { RehabPlan, Exercise } from '@/components/RehabPlanDisplay';
import ProgressLogger, { ProgressLogData } from '@/components/ProgressLogger';
import ProgressHistory, { ProgressEntry } from '@/components/ProgressHistory';
import ResourceCenter, { Resource } from '@/components/ResourceCenter';

// Shadcn UI Imports
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Toaster, toast } from "sonner"; // Corrected toast import
import { Card, CardContent } from '@/components/ui/card'; // For chat bubbles

// Use relative paths for API calls when deployed on Vercel
// For local dev with `vercel dev`, this will also work.
// If running frontend/backend separately locally, you might need localhost
const API_BASE_URL = '/api'; 

export default function Home() {
  // Chat State
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null); // Ref for scrolling chat

  // Rehab Plan State
  const [rehabPlan, setRehabPlan] = useState<RehabPlan | null>(null);
  const [isPlanLoading, setIsPlanLoading] = useState(true);
  const [planError, setPlanError] = useState<string | null>(null);

  // Progress Log State
  const [progressLog, setProgressLog] = useState<ProgressEntry[]>([]);
  const [isProgressLoading, setIsProgressLoading] = useState(true);
  const [progressError, setProgressError] = useState<string | null>(null);

  // Resource State
  const [resources, setResources] = useState<Resource[]>([]);
  const [isResourcesLoading, setIsResourcesLoading] = useState(true);
  const [resourcesError, setResourcesError] = useState<string | null>(null);

  // Progress Logger Modal State
  const [showProgressLogger, setShowProgressLogger] = useState(false);
  const [exerciseToLog, setExerciseToLog] = useState<Exercise | null>(null);

  // Fetch Rehab Plan on component mount
  const fetchRehabPlan = useCallback(async () => {
    setIsPlanLoading(true);
    setPlanError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/rehab-plan`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const planData = await response.json();
      setRehabPlan(planData);
    } catch (error) {
      console.error("Error fetching rehab plan:", error);
      setPlanError(error instanceof Error ? error.message : "Failed to load plan.");
    } finally {
      setIsPlanLoading(false);
    }
  }, []);

  const fetchProgressLog = useCallback(async () => {
    setIsProgressLoading(true);
    setProgressError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/progress`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const progressData = await response.json();
      setProgressLog(progressData);
    } catch (error) {
      console.error("Error fetching progress log:", error);
      setProgressError(error instanceof Error ? error.message : "Failed to load progress log.");
    } finally {
      setIsProgressLoading(false);
    }
  }, []);

  // NEW Fetch Resources function
  const fetchResources = useCallback(async () => {
    setIsResourcesLoading(true);
    setResourcesError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/resources`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const resourcesData = await response.json();
      setResources(resourcesData);
    } catch (error) {
      console.error("Error fetching resources:", error);
      setResourcesError(error instanceof Error ? error.message : "Failed to load resources.");
    } finally {
      setIsResourcesLoading(false);
    }
  }, []);

  // Update initial data fetch
  useEffect(() => {
    fetchRehabPlan();
    fetchProgressLog();
    fetchResources(); // Fetch resources on mount
  }, [fetchRehabPlan, fetchProgressLog, fetchResources]);

  // Scroll chat to bottom when new messages arrive
  useEffect(() => {
    chatContainerRef.current?.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: 'smooth'
    });
  }, [messages]);

  // --- Chat Handling ---
  const handleSend = async () => {
    if (input.trim() && !isChatLoading) {
      const userMessage = { sender: 'user', text: input };
      setMessages((prevMessages) => [...prevMessages, userMessage]);
      const currentInput = input; // Capture input before clearing
      setInput('');
      setIsChatLoading(true);

      try {
        const response = await fetch(`${API_BASE_URL}/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: currentInput }), // Use captured input
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! status: ${response.status} ${errorText}`);
        }

        const aiResponse = await response.json();
        setMessages((prevMessages) => [...prevMessages, aiResponse]);
      } catch (error) {
        console.error("Error fetching AI response:", error);
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: 'ai', text: `Sorry, I encountered an error: ${errorMsg}` },
        ]);
        toast.error(`Chat Error: ${errorMsg}`); // Show toast on chat error
      } finally {
        setIsChatLoading(false);
      }
    }
  };

  // --- Progress Logging Handling ---
  const handleOpenProgressLogger = (exerciseId: string) => {
    const exercise = rehabPlan?.exercises.find(ex => ex.id === exerciseId);
    if (exercise) {
      setExerciseToLog(exercise);
      setShowProgressLogger(true);
    }
  };

  const handleCloseProgressLogger = () => {
    setShowProgressLogger(false);
    setExerciseToLog(null);
  };

  const handleSaveProgress = async (logData: ProgressLogData) => {
    console.log("Saving progress:", logData);
    try {
      const response = await fetch(`${API_BASE_URL}/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logData),
      });
      if (!response.ok) {
         const errorData = await response.text();
         throw new Error(`HTTP error! status: ${response.status} - ${errorData}`);
      }
      const savedEntry = await response.json();
      console.log("Progress saved successfully:", savedEntry);
      toast.success("Progress logged successfully!"); // Show success toast
      fetchProgressLog(); // Refresh log
    } catch (error) {
       console.error("Failed to save progress:", error);
       const errorMsg = error instanceof Error ? error.message : 'Unknown error';
       toast.error(`Failed to save progress: ${errorMsg}`); // Show error toast
       // Re-throw error for the modal to potentially handle (e.g., keep modal open)
       throw error; 
    }
  };

  // --- Main Render --- 
  return (
    <div className="flex h-screen bg-background font-sans text-foreground">
      {/* Toaster for notifications */} 
      <Toaster position="top-center" richColors /> 

      {/* Left Panel Group (Rehab + Resources) - Approx 40% width */} 
      <div className="w-[40%] flex flex-col border-r border-border">
          {/* Rehab Plan Section (Top half) */} 
          <div className="flex-1 flex flex-col border-b border-border bg-card min-h-0"> {/* Added min-h-0 for flex sizing */} 
             <header className="p-3 text-center border-b border-border flex-shrink-0">
                  <h1 className="text-md font-semibold">Rehabilitation Plan</h1>
             </header>
             <ScrollArea className="flex-1 p-3">
                 <RehabPlanDisplay 
                    plan={rehabPlan}
                    isLoading={isPlanLoading}
                    error={planError}
                    onLogProgressClick={handleOpenProgressLogger}
                 />
             </ScrollArea>
          </div>
          
          {/* Resource Center Section (Bottom half) */} 
          <div className="flex-1 flex flex-col bg-card min-h-0"> {/* Added min-h-0 */} 
             <header className="p-3 text-center border-b border-border flex-shrink-0">
                  <h1 className="text-md font-semibold">Resource Center</h1>
             </header>
             <ScrollArea className="flex-1 p-3">
                 <ResourceCenter 
                     resources={resources}
                     isLoading={isResourcesLoading}
                     error={resourcesError}
                 />
             </ScrollArea>
          </div>
      </div>

      {/* Center Panel: Progress History - Approx 25% width */} 
       <div className="w-[25%] flex flex-col border-r border-border bg-card">
             <header className="p-3 text-center border-b border-border flex-shrink-0">
                  <h1 className="text-md font-semibold">Progress History</h1>
             </header>
             <ScrollArea className="flex-1 p-3">
                 <ProgressHistory 
                    progressLog={progressLog}
                    exercises={rehabPlan?.exercises || []}
                    isLoading={isProgressLoading}
                    error={progressError}
                 />
             </ScrollArea>
       </div>

      {/* Right Panel: Chat Interface - Remaining width */} 
      <div className="flex-1 flex flex-col bg-muted/30">
         <header className="p-3 text-center border-b border-border flex-shrink-0 bg-card">
            <h1 className="text-md font-semibold">AI Assistant</h1>
         </header>
         {/* Chat Message Area */}
         <ScrollArea className="flex-1 p-4 space-y-3" ref={chatContainerRef}> {/* Adjusted padding */} 
            {messages.map((msg, index) => (
                 <div
                    key={index}
                    className={`flex mb-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                 >
                    <Card className={`p-2 px-3 shadow-sm max-w-md lg:max-w-lg break-words text-sm rounded-xl ${ 
                        msg.sender === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-none'
                        : 'bg-card text-card-foreground border border-border rounded-bl-none'
                    }`}>
                       <CardContent className="p-0">
                          {msg.text.split('\n').map((line, i) => (
                             <p key={i} className="my-0.5 leading-relaxed" dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>').replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-500 underline">$1</a>') }} />
                          ))}
                       </CardContent>
                    </Card>
                 </div>
            ))}
            {isChatLoading && (
                <div className="flex justify-start">
                     <Card className="p-2 px-3 shadow-sm bg-card text-muted-foreground border border-border rounded-xl rounded-bl-none text-sm italic">
                        Assistant is thinking...
                     </Card>
                </div>
            )}
         </ScrollArea>
         {/* Chat Input Area */}
         <footer className="bg-card p-3 border-t border-border flex items-center gap-2 shadow-sm">
            <Input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask the assistant anything..."
                className="flex-1 text-sm"
                disabled={isChatLoading}
            />
            <Button onClick={handleSend} size="icon" disabled={isChatLoading}>
                 {isChatLoading ? <div className="h-4 w-4 border-2 border-t-transparent border-primary rounded-full animate-spin"></div> : 'Go'} {/* Spinner color change */} 
            </Button>
         </footer>
      </div>

      {/* Progress Logger Modal */} 
      <ProgressLogger 
          exercise={exerciseToLog}
          isOpen={showProgressLogger}
          onClose={handleCloseProgressLogger}
          onSave={handleSaveProgress}
      />
    </div>
  );
}
