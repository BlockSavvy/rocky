import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Exercise } from './RehabPlanDisplay';
import { ProgressEntry } from './ProgressHistory';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, BarChart, Bar
} from 'recharts';

interface ProgressAnalyticsProps {
  progressLog: ProgressEntry[];
  exercises: Exercise[];
}

const ProgressAnalytics: React.FC<ProgressAnalyticsProps> = ({ 
  progressLog,
  exercises
}) => {
  // Transform progress data for charts
  const painTrendData = useMemo(() => {
    const dataByDate = progressLog.reduce((acc: Record<string, { date: string; avgPain: number; count: number }>, entry) => {
      // Get just the date part as the key
      const dateKey = new Date(entry.date).toLocaleDateString();
      
      if (!acc[dateKey]) {
        acc[dateKey] = { 
          date: dateKey, 
          avgPain: 0,
          count: 0
        };
      }
      
      // Only include entries with pain data
      if (entry.pain_level !== null && entry.pain_level !== undefined) {
        acc[dateKey].avgPain = 
          (acc[dateKey].avgPain * acc[dateKey].count + entry.pain_level) / 
          (acc[dateKey].count + 1);
        acc[dateKey].count++;
      }
      
      return acc;
    }, {});
    
    // Convert to array and sort by date
    return Object.values(dataByDate)
      .filter((item) => item.count > 0)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [progressLog]);
  
  // Exercise frequency data
  const exerciseFrequencyData = useMemo(() => {
    const frequencyMap = progressLog.reduce((acc: Record<string, { name: string; count: number }>, entry) => {
      const exerciseName = exercises.find(ex => ex.id === entry.exercise_id)?.name || 'Unknown';
      
      if (!acc[exerciseName]) {
        acc[exerciseName] = { 
          name: exerciseName, 
          count: 0 
        };
      }
      
      acc[exerciseName].count++;
      return acc;
    }, {});
    
    return Object.values(frequencyMap).sort((a, b) => b.count - a.count);
  }, [progressLog, exercises]);
  
  // Calculate completion metrics
  const completionMetrics = useMemo(() => {
    if (progressLog.length === 0 || exercises.length === 0) {
      return { 
        completionRate: 0,
        totalEntries: 0,
        uniqueExercises: 0,
        streakDays: 0
      };
    }
    
    // Get unique exercise IDs that have been logged
    const loggedExerciseIds = new Set(progressLog.map(entry => entry.exercise_id));
    const uniqueExercises = loggedExerciseIds.size;
    
    // Calculate what percentage of assigned exercises have been logged at least once
    const completionRate = Math.round((uniqueExercises / exercises.length) * 100);
    
    // Count total entries
    const totalEntries = progressLog.length;
    
    // Calculate streak (consecutive days with at least one log)
    const dateSet = new Set<string>();
    progressLog.forEach(entry => {
      dateSet.add(new Date(entry.date).toLocaleDateString());
    });
    
    const dates = Array.from(dateSet).map(d => new Date(d).getTime()).sort();
    let streakDays = 0;
    let currentStreak = 1; // Start with 1 for the first day
    
    for (let i = 1; i < dates.length; i++) {
      const prevDate = new Date(dates[i-1]);
      const currDate = new Date(dates[i]);
      
      // Check if dates are consecutive (86400000 = milliseconds in a day)
      if (currDate.getTime() - prevDate.getTime() <= 86400000) {
        currentStreak++;
      } else {
        // Reset streak if a day was missed
        currentStreak = 1;
      }
      
      // Update maximum streak
      streakDays = Math.max(streakDays, currentStreak);
    }
    
    // If we only have one date, the streak is 1
    if (dates.length === 1) {
      streakDays = 1;
    }
    
    return { 
      completionRate,
      totalEntries,
      uniqueExercises,
      streakDays
    };
  }, [progressLog, exercises]);

  if (progressLog.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Progress Analytics</CardTitle>
            <CardDescription>
              Track your rehabilitation journey with visual analytics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6 text-muted-foreground">
              <p>No progress data available yet. Start logging your exercises to see analytics.</p>
              <p className="mt-2 text-sm">Your progress charts and insights will appear here as you log your rehabilitation activities.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card overflow-hidden relative group hover:shadow-md transition-all">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-70"></div>
          <CardHeader className="pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-muted-foreground">Plan Completion</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{completionMetrics.completionRate}%</span>
                <span className="text-xs text-muted-foreground">{completionMetrics.uniqueExercises} of {exercises.length} exercises</span>
              </div>
              <Progress value={completionMetrics.completionRate} className="h-2" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card overflow-hidden relative group hover:shadow-md transition-all">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-70"></div>
          <CardHeader className="pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Logs</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold">{completionMetrics.totalEntries}</div>
            <p className="text-xs text-muted-foreground mt-1">Progress entries recorded</p>
          </CardContent>
        </Card>
        
        <Card className="bg-card overflow-hidden relative group hover:shadow-md transition-all">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-70"></div>
          <CardHeader className="pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-muted-foreground">Streak</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold">{completionMetrics.streakDays}</div>
            <p className="text-xs text-muted-foreground mt-1">Consecutive days</p>
          </CardContent>
        </Card>
        
        <Card className="bg-card overflow-hidden relative group hover:shadow-md transition-all">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-70"></div>
          <CardHeader className="pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-muted-foreground">Latest Pain Level</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            {progressLog.length > 0 && progressLog[progressLog.length - 1].pain_level !== null ? (
              <>
                <div className="text-2xl font-bold">
                  {progressLog[progressLog.length - 1].pain_level}/10
                </div>
                <p className="text-xs text-muted-foreground mt-1">Last recorded pain level</p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No pain data</p>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Pain Trend Chart */}
      <Card className="overflow-hidden border-t-4 border-t-primary/60 border-l-0 border-r-0 border-b-0 shadow-md">
        <CardHeader>
          <CardTitle>Pain Level Trend</CardTitle>
          <CardDescription>
            Track how your pain levels change over time
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="h-[250px] w-full">
            {painTrendData.length > 1 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={painTrendData}
                  margin={{ top: 5, right: 30, left: 5, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }} 
                    tickMargin={10}
                  />
                  <YAxis 
                    domain={[0, 10]} 
                    tick={{ fontSize: 12 }} 
                    tickMargin={10}
                  />
                  <RechartsTooltip 
                    formatter={(value: number) => [`${value.toFixed(1)}/10`, 'Avg Pain']}
                    labelFormatter={(label) => `Date: ${label}`}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.5rem',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="avgPain" 
                    name="Average Pain"
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <p>Need more data points to generate chart</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Exercise Frequency Chart */}
      <Card className="overflow-hidden border-t-4 border-t-primary/60 border-l-0 border-r-0 border-b-0 shadow-md">
        <CardHeader>
          <CardTitle>Exercise Frequency</CardTitle>
          <CardDescription>
            Which exercises you&apos;ve been focusing on the most
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="h-[250px] w-full">
            {exerciseFrequencyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={exerciseFrequencyData.slice(0, 5)} // Show top 5
                  margin={{ top: 5, right: 30, left: 5, bottom: 5 }}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} horizontal={true} vertical={false} />
                  <XAxis type="number" />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    tick={{ fontSize: 12 }} 
                    width={120}
                  />
                  <RechartsTooltip 
                    formatter={(value: number) => [`${value} times`, 'Frequency']}
                    labelFormatter={(label) => `Exercise: ${label}`}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.5rem',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Bar 
                    dataKey="count" 
                    name="Times Logged"
                    fill="hsl(var(--primary))" 
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <p>Need more data to generate chart</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgressAnalytics; 