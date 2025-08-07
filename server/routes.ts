import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertWorkoutSchema, insertHealthMetricsSchema, insertScheduledWorkoutSchema } from "@shared/schema";

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Middleware to check authentication
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  // Workout routes
  app.get("/api/workouts", requireAuth, async (req, res) => {
    try {
      const workouts = await storage.getWorkoutsByUserId(req.user.id);
      res.json(workouts);
    } catch (error) {
      res.status(500).json({ message: "Error fetching workouts" });
    }
  });

  app.post("/api/workouts", requireAuth, async (req, res) => {
    try {
      const workoutData = insertWorkoutSchema.parse({
        ...req.body,
        userId: req.user.id,
      });
      const workout = await storage.createWorkout(workoutData);
      res.status(201).json(workout);
    } catch (error) {
      res.status(400).json({ message: "Invalid workout data" });
    }
  });

  app.get("/api/workouts/:id", requireAuth, async (req, res) => {
    try {
      const workout = await storage.getWorkout(req.params.id);
      if (!workout || workout.userId !== req.user.id) {
        return res.status(404).json({ message: "Workout not found" });
      }
      res.json(workout);
    } catch (error) {
      res.status(500).json({ message: "Error fetching workout" });
    }
  });

  app.delete("/api/workouts/:id", requireAuth, async (req, res) => {
    try {
      const workout = await storage.getWorkout(req.params.id);
      if (!workout || workout.userId !== req.user.id) {
        return res.status(404).json({ message: "Workout not found" });
      }
      
      const deleted = await storage.deleteWorkout(req.params.id);
      if (deleted) {
        res.sendStatus(204);
      } else {
        res.status(500).json({ message: "Error deleting workout" });
      }
    } catch (error) {
      res.status(500).json({ message: "Error deleting workout" });
    }
  });

  // Health metrics routes
  app.get("/api/health-metrics", requireAuth, async (req, res) => {
    try {
      const metrics = await storage.getHealthMetricsByUserId(req.user.id);
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Error fetching health metrics" });
    }
  });

  app.get("/api/health-metrics/latest", requireAuth, async (req, res) => {
    try {
      const metrics = await storage.getLatestHealthMetrics(req.user.id);
      res.json(metrics || null);
    } catch (error) {
      res.status(500).json({ message: "Error fetching latest health metrics" });
    }
  });

  app.post("/api/health-metrics", requireAuth, async (req, res) => {
    try {
      const metricsData = insertHealthMetricsSchema.parse({
        ...req.body,
        userId: req.user.id,
      });
      const metrics = await storage.createHealthMetrics(metricsData);
      res.status(201).json(metrics);
    } catch (error) {
      res.status(400).json({ message: "Invalid health metrics data" });
    }
  });

  // Scheduled workouts routes
  app.get("/api/scheduled-workouts", requireAuth, async (req, res) => {
    try {
      const workouts = await storage.getScheduledWorkoutsByUserId(req.user.id);
      res.json(workouts);
    } catch (error) {
      res.status(500).json({ message: "Error fetching scheduled workouts" });
    }
  });

  app.post("/api/scheduled-workouts", requireAuth, async (req, res) => {
    try {
      const workoutData = insertScheduledWorkoutSchema.parse({
        ...req.body,
        userId: req.user.id,
      });
      const workout = await storage.createScheduledWorkout(workoutData);
      res.status(201).json(workout);
    } catch (error) {
      res.status(400).json({ message: "Invalid scheduled workout data" });
    }
  });

  app.patch("/api/scheduled-workouts/:id", requireAuth, async (req, res) => {
    try {
      const workout = await storage.getScheduledWorkout(req.params.id);
      if (!workout || workout.userId !== req.user.id) {
        return res.status(404).json({ message: "Scheduled workout not found" });
      }
      
      const updatedWorkout = await storage.updateScheduledWorkout(req.params.id, req.body);
      res.json(updatedWorkout);
    } catch (error) {
      res.status(500).json({ message: "Error updating scheduled workout" });
    }
  });

  app.delete("/api/scheduled-workouts/:id", requireAuth, async (req, res) => {
    try {
      const workout = await storage.getScheduledWorkout(req.params.id);
      if (!workout || workout.userId !== req.user.id) {
        return res.status(404).json({ message: "Scheduled workout not found" });
      }
      
      const deleted = await storage.deleteScheduledWorkout(req.params.id);
      if (deleted) {
        res.sendStatus(204);
      } else {
        res.status(500).json({ message: "Error deleting scheduled workout" });
      }
    } catch (error) {
      res.status(500).json({ message: "Error deleting scheduled workout" });
    }
  });

  // User profile routes
  app.patch("/api/user/profile", requireAuth, async (req, res) => {
    try {
      const updatedUser = await storage.updateUser(req.user.id, req.body);
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: "Error updating profile" });
    }
  });

  // Dashboard stats route
  app.get("/api/dashboard/stats", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      const workouts = await storage.getWorkoutsByUserId(req.user.id);
      const latestMetrics = await storage.getLatestHealthMetrics(req.user.id);
      
      // Calculate weekly workouts
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const weeklyWorkouts = workouts.filter(w => 
        new Date(w.createdAt!) >= oneWeekAgo
      ).length;

      // Calculate weight progress
      const metrics = await storage.getHealthMetricsByUserId(req.user.id);
      let weightProgress = 0;
      if (metrics.length >= 2 && user?.currentWeight) {
        const oldestWeight = metrics[metrics.length - 1].weight || user.currentWeight;
        const latestWeight = latestMetrics?.weight || user.currentWeight;
        weightProgress = latestWeight - oldestWeight;
      }

      const stats = {
        currentStreak: user?.currentStreak || 0,
        longestStreak: user?.longestStreak || 0,
        weeklyWorkouts,
        totalWorkouts: workouts.length,
        weightProgress: Math.round(weightProgress * 10) / 10,
        currentWeight: latestMetrics?.weight || user?.currentWeight,
        targetWeight: user?.targetWeight,
      };

      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Error fetching dashboard stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
