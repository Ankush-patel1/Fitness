import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { Weight, Dumbbell, Target, Heart, Loader2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const onboardingSchema = z.object({
  fitnessGoals: z.array(z.string()).min(1, "Please select at least one fitness goal"),
  currentWeight: z.number().min(50, "Weight must be at least 50 lbs").max(500, "Weight must be less than 500 lbs"),
  targetWeight: z.number().min(50, "Weight must be at least 50 lbs").max(500, "Weight must be less than 500 lbs"),
  workoutFrequency: z.number().min(1, "Please select workout frequency").max(7, "Maximum 7 times per week"),
});

type OnboardingForm = z.infer<typeof onboardingSchema>;

const fitnessGoalOptions = [
  { id: "lose_weight", label: "Lose Weight", icon: Weight },
  { id: "build_muscle", label: "Build Muscle", icon: Dumbbell },
  { id: "improve_endurance", label: "Improve Endurance", icon: Target },
  { id: "stay_healthy", label: "Stay Healthy", icon: Heart },
];

const workoutFrequencyOptions = [
  { value: 2, label: "2x/week" },
  { value: 3, label: "3x/week" },
  { value: 4, label: "4x/week" },
  { value: 7, label: "Daily" },
];

export default function OnboardingPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedFrequency, setSelectedFrequency] = useState<number | null>(null);
  const { toast } = useToast();

  const form = useForm<OnboardingForm>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      fitnessGoals: [],
      currentWeight: 150,
      targetWeight: 140,
      workoutFrequency: 3,
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<OnboardingForm>) => {
      const res = await apiRequest("PATCH", "/api/user/profile", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Profile setup complete!",
        description: "Welcome to FitTrack Pro. Let's start your fitness journey!",
      });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Setup failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleGoalToggle = (goalId: string) => {
    const newGoals = selectedGoals.includes(goalId)
      ? selectedGoals.filter(g => g !== goalId)
      : [...selectedGoals, goalId];
    
    setSelectedGoals(newGoals);
    form.setValue("fitnessGoals", newGoals);
  };

  const handleFrequencySelect = (frequency: number) => {
    setSelectedFrequency(frequency);
    form.setValue("workoutFrequency", frequency);
  };

  const onSubmit = (data: OnboardingForm) => {
    updateProfileMutation.mutate(data);
  };

  const handleSkip = () => {
    setLocation("/");
  };

  if (!user) {
    setLocation("/auth");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-3xl">Welcome to FitTrack Pro!</CardTitle>
          <CardDescription className="text-lg">
            Let's set up your fitness profile to personalize your experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Fitness Goals */}
              <FormField
                control={form.control}
                name="fitnessGoals"
                render={() => (
                  <FormItem>
                    <FormLabel className="text-xl font-semibold">What are your fitness goals?</FormLabel>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                      {fitnessGoalOptions.map((goal) => {
                        const IconComponent = goal.icon;
                        const isSelected = selectedGoals.includes(goal.id);
                        return (
                          <button
                            key={goal.id}
                            type="button"
                            className={`border-2 rounded-lg p-4 hover:border-primary transition-colors ${
                              isSelected 
                                ? "border-primary bg-primary bg-opacity-5" 
                                : "border-gray-200"
                            }`}
                            onClick={() => handleGoalToggle(goal.id)}
                          >
                            <div className="text-center">
                              <IconComponent className="h-8 w-8 text-primary mx-auto mb-2" />
                              <h4 className="font-semibold">{goal.label}</h4>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Weight Goals */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="currentWeight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Weight (lbs)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="150" 
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="targetWeight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Weight (lbs)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="140" 
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Workout Frequency */}
              <FormField
                control={form.control}
                name="workoutFrequency"
                render={() => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold">How often do you want to work out?</FormLabel>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                      {workoutFrequencyOptions.map((option) => (
                        <Button
                          key={option.value}
                          type="button"
                          variant={selectedFrequency === option.value ? "default" : "outline"}
                          onClick={() => handleFrequencySelect(option.value)}
                          className="h-12"
                        >
                          {option.label}
                        </Button>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Action Buttons */}
              <div className="flex justify-between pt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleSkip}
                  disabled={updateProfileMutation.isPending}
                >
                  Skip for now
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateProfileMutation.isPending}
                  className="min-w-[140px]"
                >
                  {updateProfileMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Complete Setup
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
