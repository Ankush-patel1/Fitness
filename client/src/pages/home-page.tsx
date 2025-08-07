import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertWorkoutSchema, insertHealthMetricsSchema, type Workout, type HealthMetrics } from "@shared/schema";
import { z } from "zod";
import { 
  Flame, 
  Dumbbell, 
  TrendingUp, 
  Trophy, 
  Plus, 
  Heart, 
  Calendar, 
  Bell,
  Home,
  Loader2,
  Weight,
  Droplets,
  Moon,
  Activity
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

const workoutFormSchema = insertWorkoutSchema.omit({ userId: true }).extend({
  exercises: z.string().min(1, "Please add at least one exercise"),
});

const healthFormSchema = insertHealthMetricsSchema.omit({ userId: true });

type WorkoutForm = z.infer<typeof workoutFormSchema>;
type HealthForm = z.infer<typeof healthFormSchema>;

const workoutTypes = [
  "Strength Training",
  "Cardio",
  "Yoga",
  "Pilates",
  "Sports",
  "Swimming",
  "Running",
  "Cycling",
  "Other"
];

const sleepQualityOptions = [
  { value: "poor", label: "Poor" },
  { value: "fair", label: "Fair" },
  { value: "good", label: "Good" },
  { value: "excellent", label: "Excellent" },
];

export default function HomePage() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const [workoutModalOpen, setWorkoutModalOpen] = useState(false);
  const [healthModalOpen, setHealthModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  // Fetch recent workouts
  const { data: workouts, isLoading: workoutsLoading } = useQuery<Workout[]>({
    queryKey: ["/api/workouts"],
  });

  // Fetch recent health metrics
  const { data: healthMetrics } = useQuery<HealthMetrics[]>({
    queryKey: ["/api/health-metrics"],
  });

  const workoutForm = useForm<WorkoutForm>({
    resolver: zodResolver(workoutFormSchema),
    defaultValues: {
      name: "",
      type: "",
      duration: 30,
      exercises: "",
      notes: "",
    },
  });

  const healthForm = useForm<HealthForm>({
    resolver: zodResolver(healthFormSchema),
    defaultValues: {
      weight: undefined,
      sleepHours: undefined,
      sleepQuality: undefined,
      waterIntake: undefined,
      notes: "",
    },
  });

  const createWorkoutMutation = useMutation({
    mutationFn: async (data: WorkoutForm) => {
      const res = await apiRequest("POST", "/api/workouts", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workouts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      setWorkoutModalOpen(false);
      workoutForm.reset();
      toast({
        title: "Workout logged!",
        description: "Your workout has been successfully recorded.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to log workout",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createHealthMetricsMutation = useMutation({
    mutationFn: async (data: HealthForm) => {
      const res = await apiRequest("POST", "/api/health-metrics", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/health-metrics"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      setHealthModalOpen(false);
      healthForm.reset();
      toast({
        title: "Health metrics updated!",
        description: "Your health data has been successfully recorded.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update health metrics",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onWorkoutSubmit = (data: WorkoutForm) => {
    createWorkoutMutation.mutate(data);
  };

  const onHealthSubmit = (data: HealthForm) => {
    createHealthMetricsMutation.mutate(data);
  };

  const recentWorkouts = workouts?.slice(0, 3) || [];

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-primary">FitTrack Pro</span>
              <div className="ml-10 hidden md:flex space-x-8">
                <button 
                  className={`px-1 pb-4 text-sm font-medium border-b-2 ${
                    activeTab === "dashboard" 
                      ? "text-primary border-primary" 
                      : "text-gray-500 hover:text-gray-700 border-transparent"
                  }`}
                  onClick={() => setActiveTab("dashboard")}
                >
                  Dashboard
                </button>
                <button 
                  className={`px-1 pb-4 text-sm font-medium border-b-2 ${
                    activeTab === "workouts" 
                      ? "text-primary border-primary" 
                      : "text-gray-500 hover:text-gray-700 border-transparent"
                  }`}
                  onClick={() => setActiveTab("workouts")}
                >
                  Workouts
                </button>
                <button 
                  className={`px-1 pb-4 text-sm font-medium border-b-2 ${
                    activeTab === "health" 
                      ? "text-primary border-primary" 
                      : "text-gray-500 hover:text-gray-700 border-transparent"
                  }`}
                  onClick={() => setActiveTab("health")}
                >
                  Health
                </button>
                <button 
                  className={`px-1 pb-4 text-sm font-medium border-b-2 ${
                    activeTab === "schedule" 
                      ? "text-primary border-primary" 
                      : "text-gray-500 hover:text-gray-700 border-transparent"
                  }`}
                  onClick={() => setActiveTab("schedule")}
                >
                  Schedule
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </span>
                </div>
                <div className="hidden sm:block">
                  <span className="text-sm font-medium text-gray-700">
                    {user.firstName} {user.lastName}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => logoutMutation.mutate()}
                  disabled={logoutMutation.isPending}
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {user.firstName}! 👋
          </h1>
          <p className="text-gray-600">Here's your fitness progress today</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-primary bg-opacity-10 rounded-lg">
                  <Flame className="text-primary h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Current Streak</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statsLoading ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      `${stats?.currentStreak || 0} days`
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-secondary bg-opacity-10 rounded-lg">
                  <Dumbbell className="text-secondary h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Workouts This Week</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statsLoading ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      `${stats?.weeklyWorkouts || 0} / 7`
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-accent bg-opacity-10 rounded-lg">
                  <TrendingUp className="text-accent h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Weight Progress</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statsLoading ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      stats?.weightProgress 
                        ? `${stats.weightProgress > 0 ? '+' : ''}${stats.weightProgress} lbs`
                        : "No data"
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-500 bg-opacity-10 rounded-lg">
                  <Trophy className="text-purple-500 h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Workouts</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statsLoading ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      stats?.totalWorkouts || 0
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Progress Chart Placeholder */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Weight Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <Activity className="h-12 w-12 mx-auto mb-2" />
                    <p>Progress chart coming soon</p>
                    <p className="text-sm">Track your weight changes over time</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full" 
                onClick={() => setWorkoutModalOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Log Workout
              </Button>
              <Button 
                className="w-full bg-secondary hover:bg-secondary/90" 
                onClick={() => setHealthModalOpen(true)}
              >
                <Heart className="mr-2 h-4 w-4" />
                Update Health
              </Button>
              <Button 
                className="w-full bg-accent hover:bg-accent/90" 
                variant="outline"
              >
                <Calendar className="mr-2 h-4 w-4" />
                Schedule Workout
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            {workoutsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : recentWorkouts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Dumbbell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No workouts logged yet</p>
                <p className="text-sm">Start your fitness journey by logging your first workout!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentWorkouts.map((workout) => (
                  <div key={workout.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                      <Dumbbell className="h-5 w-5 text-white" />
                    </div>
                    <div className="ml-4 flex-1">
                      <p className="font-medium text-gray-900">{workout.name}</p>
                      <p className="text-sm text-gray-600">
                        {workout.duration} minutes • {workout.type}
                      </p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(workout.createdAt!).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Mobile Navigation */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
          <div className="grid grid-cols-4 py-2">
            <button 
              className={`flex flex-col items-center py-2 ${
                activeTab === "dashboard" ? "text-primary" : "text-gray-400"
              }`}
              onClick={() => setActiveTab("dashboard")}
            >
              <Home className="h-5 w-5 mb-1" />
              <span className="text-xs">Home</span>
            </button>
            <button 
              className={`flex flex-col items-center py-2 ${
                activeTab === "workouts" ? "text-primary" : "text-gray-400"
              }`}
              onClick={() => setActiveTab("workouts")}
            >
              <Dumbbell className="h-5 w-5 mb-1" />
              <span className="text-xs">Workouts</span>
            </button>
            <button 
              className={`flex flex-col items-center py-2 ${
                activeTab === "health" ? "text-primary" : "text-gray-400"
              }`}
              onClick={() => setActiveTab("health")}
            >
              <Heart className="h-5 w-5 mb-1" />
              <span className="text-xs">Health</span>
            </button>
            <button 
              className={`flex flex-col items-center py-2 ${
                activeTab === "schedule" ? "text-primary" : "text-gray-400"
              }`}
              onClick={() => setActiveTab("schedule")}
            >
              <Calendar className="h-5 w-5 mb-1" />
              <span className="text-xs">Schedule</span>
            </button>
          </div>
        </div>
      )}

      {/* Workout Modal */}
      <Dialog open={workoutModalOpen} onOpenChange={setWorkoutModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-screen overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Log Workout</DialogTitle>
            <DialogDescription>
              Record your workout details and track your progress
            </DialogDescription>
          </DialogHeader>
          <Form {...workoutForm}>
            <form onSubmit={workoutForm.handleSubmit(onWorkoutSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={workoutForm.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Workout Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select workout type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {workoutTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={workoutForm.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (minutes)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="45" 
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={workoutForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Workout Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Upper Body Strength" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={workoutForm.control}
                name="exercises"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Exercises</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Bench Press 3x12 @ 135lbs&#10;Squats 3x15 @ 100lbs&#10;Pull-ups 3x8"
                        rows={4}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={workoutForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="How did the workout feel? Any observations?"
                        rows={3}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setWorkoutModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createWorkoutMutation.isPending}
                >
                  {createWorkoutMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Log Workout
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Health Metrics Modal */}
      <Dialog open={healthModalOpen} onOpenChange={setHealthModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Update Health Metrics</DialogTitle>
            <DialogDescription>
              Track your health data to monitor your progress
            </DialogDescription>
          </DialogHeader>
          <Form {...healthForm}>
            <form onSubmit={healthForm.handleSubmit(onHealthSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={healthForm.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Weight className="h-4 w-4" />
                        Weight (lbs)
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1"
                          placeholder="148.5" 
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={healthForm.control}
                  name="waterIntake"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Droplets className="h-4 w-4" />
                        Water Intake (glasses)
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="8" 
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={healthForm.control}
                name="sleepHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Moon className="h-4 w-4" />
                      Sleep Duration (hours)
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.5"
                        placeholder="7.5" 
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={healthForm.control}
                name="sleepQuality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sleep Quality</FormLabel>
                    <div className="flex space-x-2">
                      {sleepQualityOptions.map((option) => (
                        <Button
                          key={option.value}
                          type="button"
                          variant={field.value === option.value ? "default" : "outline"}
                          className="flex-1"
                          onClick={() => field.onChange(option.value)}
                        >
                          {option.label}
                        </Button>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={healthForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Any additional notes about your health today?"
                        rows={3}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setHealthModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createHealthMetricsMutation.isPending}
                  className="bg-secondary hover:bg-secondary/90"
                >
                  {createHealthMetricsMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Update Metrics
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
