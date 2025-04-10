'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import RehabPlanDisplay, { RehabPlan, Exercise } from '@/components/RehabPlanDisplay';
import ProgressLogger, { ProgressLogData } from '@/components/ProgressLogger';
import ProgressHistory, { ProgressEntry } from '@/components/ProgressHistory';
import ResourceCenter, { Resource } from '@/components/ResourceCenter';
import ProgressAnalytics from '@/components/ProgressAnalytics';

// Shadcn UI Imports
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Toaster, toast } from "sonner";
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Send, Bot, User, Activity, FileText, Hourglass, 
  PanelRight, PanelRightClose, ChevronRight,
  BarChart3, HomeIcon, HelpCircle
} from 'lucide-react';

// Use environment variable for API base URL
// Fallback to local Next.js API routes if variable not set
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';
console.log(`Using API Base URL: ${API_BASE_URL}`);

export default function Home() {
  // Chat State
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isChatExpanded, setIsChatExpanded] = useState(false);

  // Navigation State
  const [activeTab, setActiveTab] = useState("home");

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
    fetchResources();
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
      const currentInput = input;
      setInput('');
      setIsChatLoading(true);

      try {
        const response = await fetch(`${API_BASE_URL}/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: currentInput }),
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
        toast.error(`Chat Error: ${errorMsg}`);
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
      toast.success("Progress logged successfully!");
      fetchProgressLog();
    } catch (error) {
       console.error("Failed to save progress:", error);
       const errorMsg = error instanceof Error ? error.message : 'Unknown error';
       toast.error(`Failed to save progress: ${errorMsg}`);
       throw error; 
    }
  };

  // Toggle Chat Panel
  const toggleChatPanel = () => {
    setIsChatExpanded(!isChatExpanded);
  };

  // --- Main Render --- 
  return (
    <div className="flex flex-col h-full bg-background font-sans text-foreground overflow-hidden"> 
      <TooltipProvider>
        <Toaster position="top-center" richColors />

        {/* Main Header with Branding and Chat Toggle */}
        <header className="border-b border-border p-3 shadow-md flex items-center justify-between relative z-10 backdrop-blur-sm bg-card/80">
          <div className="flex items-center space-x-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Activity className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-semibold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Rocky Rehab Assistant</h1>
          </div>

          {/* Chat Toggle Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={toggleChatPanel}
                className="relative hover:bg-primary/10 hover:text-primary transition-all"
              >
                {isChatExpanded ? <PanelRightClose className="h-4 w-4" /> : <PanelRight className="h-4 w-4" />}
                {messages.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] w-4 h-4 flex items-center justify-center rounded-full shadow-md">
                    {messages.filter(m => m.sender === 'ai').length}
                  </span>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>{isChatExpanded ? "Hide" : "Show"} AI Assistant</p>
            </TooltipContent>
          </Tooltip>
        </header>
        
        {/* Main Content Area with Tabs */}
        <div className="flex flex-1 overflow-hidden">
          {/* Main Content Wrapper */}
          <div className={`flex-1 transition-all duration-300 ${isChatExpanded ? 'mr-[400px]' : ''}`}>
            {/* Tabs Component - Important: It wraps both TabsList and TabsContent */}
            <Tabs 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="flex flex-col h-full"
            >
              {/* Navigation Tabs */}
              <div className="px-4 pt-4">
                <TabsList className="grid grid-cols-4 max-w-[600px] p-1 bg-muted/50 backdrop-blur-sm">
                  <TabsTrigger value="home" className="flex items-center gap-1.5 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-md">
                    <HomeIcon className="h-4 w-4" />
                    <span>Home</span>
                  </TabsTrigger>
                  
                  <TabsTrigger value="progress" className="flex items-center gap-1.5 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-md">
                    <Hourglass className="h-4 w-4" />
                    <span>Progress</span>
                  </TabsTrigger>
                  
                  <TabsTrigger value="analytics" className="flex items-center gap-1.5 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-md">
                    <BarChart3 className="h-4 w-4" />
                    <span>Analytics</span>
                  </TabsTrigger>
                  
                  <TabsTrigger value="resources" className="flex items-center gap-1.5 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-md">
                    <FileText className="h-4 w-4" />
                    <span>Resources</span>
                  </TabsTrigger>
                </TabsList>
              </div>
              
              {/* Tab Contents - Inside a scrollable container */}
              <div className="p-4 flex-1 overflow-auto">
                <TabsContent value="home" className="h-full flex flex-col space-y-4 mt-0 data-[state=inactive]:hidden">
                  {/* Rehab Plan Section */}
                  <div className="flex-1 flex flex-col border border-border rounded-xl shadow-md bg-card overflow-hidden"> 
                    <header className="p-4 flex items-center gap-2 border-b border-border bg-muted/40 backdrop-blur-sm"> 
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Activity className="h-4 w-4" />
                      </div>
                      <h2 className="text-lg font-semibold">Rehabilitation Plan</h2>
                      
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="ml-auto hover:bg-primary/10 hover:text-primary transition-colors">
                            <HelpCircle className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="left" className="max-w-[250px]">
                          <p>This is your personalized rehabilitation plan. Track your exercises and log your progress.</p>
                        </TooltipContent>
                      </Tooltip>
                    </header>
                    <ScrollArea className="flex-1 p-4"> 
                      <RehabPlanDisplay 
                        plan={rehabPlan}
                        isLoading={isPlanLoading}
                        error={planError}
                        onLogProgressClick={handleOpenProgressLogger}
                      />
                    </ScrollArea>
                  </div>
                </TabsContent>
                
                <TabsContent value="progress" className="h-full mt-0 data-[state=inactive]:hidden">
                  <div className="h-full flex flex-col border border-border rounded-xl shadow-md bg-card overflow-hidden">
                    <header className="p-4 flex items-center gap-2 border-b border-border bg-muted/40 backdrop-blur-sm"> 
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Hourglass className="h-4 w-4" />
                      </div>
                      <h2 className="text-lg font-semibold">Progress History</h2>
                    </header>
                    <ScrollArea className="flex-1 p-4"> 
                      <ProgressHistory 
                        progressLog={progressLog}
                        exercises={rehabPlan?.exercises || []}
                        isLoading={isProgressLoading}
                        error={progressError}
                      />
                    </ScrollArea>
                  </div>
                </TabsContent>
                
                <TabsContent value="analytics" className="h-full mt-0 data-[state=inactive]:hidden">
                  <div className="h-full flex flex-col border border-border rounded-xl shadow-md bg-card overflow-hidden">
                    <header className="p-4 flex items-center gap-2 border-b border-border bg-muted/40 backdrop-blur-sm"> 
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <BarChart3 className="h-4 w-4" />
                      </div>
                      <h2 className="text-lg font-semibold">Progress Analytics</h2>
                    </header>
                    <ScrollArea className="flex-1 p-4"> 
                      <ProgressAnalytics 
                        progressLog={progressLog}
                        exercises={rehabPlan?.exercises || []}
                      />
                    </ScrollArea>
                  </div>
                </TabsContent>
                
                <TabsContent value="resources" className="h-full mt-0 data-[state=inactive]:hidden">
                  <div className="h-full flex flex-col border border-border rounded-xl shadow-md bg-card overflow-hidden">
                    <header className="p-4 flex items-center gap-2 border-b border-border bg-muted/40 backdrop-blur-sm"> 
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <FileText className="h-4 w-4" />
                      </div>
                      <h2 className="text-lg font-semibold">Resource Center</h2>
                    </header>
                    <ScrollArea className="flex-1 p-4"> 
                      <ResourceCenter 
                        resources={resources}
                        isLoading={isResourcesLoading}
                        error={resourcesError}
                      />
                    </ScrollArea>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
          
          {/* Collapsible Chat Panel */}
          <div 
            className={`fixed top-[60px] right-0 bottom-0 w-[400px] flex flex-col bg-card border-l border-border shadow-lg transform transition-transform duration-300 ease-in-out ${
              isChatExpanded ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            <header className="p-4 flex items-center gap-2 border-b border-border bg-muted/40 backdrop-blur-sm"> 
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Bot className="h-4 w-4" />
              </div>
              <h2 className="text-lg font-semibold">AI Assistant</h2>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleChatPanel}
                className="ml-auto hover:bg-primary/10 hover:text-primary transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </header>
            
            {/* Chat Message Area */} 
            <ScrollArea 
              className="flex-1 p-4 space-y-3 bg-muted/10" 
              ref={chatContainerRef}
            > 
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4 text-muted-foreground px-6">
                  <div className="rounded-full bg-primary/10 p-4">
                    <Bot className="h-10 w-10 text-primary opacity-60" />
                  </div>
                  <h3 className="text-lg font-medium">Rehab Assistant</h3>
                  <p className="text-sm">Ask me anything about your rehabilitation plan, exercises, or how to track your progress.</p>
                </div>
              )}
              
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} message-bubble`}
                >
                  {msg.sender === 'ai' && (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}
                  <Card className={`p-3 shadow-md max-w-[85%] break-words text-sm rounded-lg ${ 
                    msg.sender === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-none'
                      : 'bg-card text-card-foreground border rounded-bl-none'
                  }`}>
                    <CardContent className="p-0">
                      {msg.text.split('\n').map((line, i) => (
                        <p key={i} className="my-0.5 leading-relaxed" dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>').replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-500 underline">$1</a>') }} />
                      ))}
                    </CardContent>
                  </Card>
                  {msg.sender === 'user' && (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))}
              {isChatLoading && (
                <div className="flex justify-start gap-2.5 message-bubble">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Bot className="h-4 w-4" />
                  </div>
                  <Card className="p-2 px-3 shadow-sm bg-card text-muted-foreground border rounded-xl rounded-bl-none text-sm italic">
                    <div className="flex items-center gap-2">
                      <div className="flex space-x-1">
                        <div className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="h-2 w-2 rounded-full bg-primary animate-bounce"></div>
                      </div>
                      <span>Thinking...</span>
                    </div>
                  </Card>
                </div>
              )}
            </ScrollArea>
            
            {/* Chat Input Area */} 
            <footer className="bg-card p-3 border-t border-border flex items-center gap-2 shadow-md"> 
              <Input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask the assistant anything..."
                className="flex-1 text-sm bg-muted/30 focus:border-primary/40 focus:ring-primary/20"
                disabled={isChatLoading}
              />
              <Button 
                onClick={handleSend} 
                size="icon" 
                variant="default"
                disabled={isChatLoading}
                className="btn-primary shrink-0"
              >
                {isChatLoading ? 
                  <div className="h-4 w-4 border-2 border-t-transparent border-primary-foreground rounded-full animate-spin"></div> : 
                  <Send className="h-4 w-4" />
                }
              </Button>
            </footer>
          </div>
        </div>
      </TooltipProvider>

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
