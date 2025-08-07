import { type User, type InsertUser, type Workout, type InsertWorkout, type HealthMetrics, type InsertHealthMetrics, type ScheduledWorkout, type InsertScheduledWorkout } from "@shared/schema";
import { randomUUID } from "crypto";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;

  // Workout methods
  getWorkoutsByUserId(userId: string): Promise<Workout[]>;
  getWorkout(id: string): Promise<Workout | undefined>;
  createWorkout(workout: InsertWorkout): Promise<Workout>;
  updateWorkout(id: string, updates: Partial<Workout>): Promise<Workout | undefined>;
  deleteWorkout(id: string): Promise<boolean>;

  // Health metrics methods
  getHealthMetricsByUserId(userId: string): Promise<HealthMetrics[]>;
  getLatestHealthMetrics(userId: string): Promise<HealthMetrics | undefined>;
  createHealthMetrics(metrics: InsertHealthMetrics): Promise<HealthMetrics>;

  // Scheduled workouts methods
  getScheduledWorkoutsByUserId(userId: string): Promise<ScheduledWorkout[]>;
  getScheduledWorkout(id: string): Promise<ScheduledWorkout | undefined>;
  createScheduledWorkout(workout: InsertScheduledWorkout): Promise<ScheduledWorkout>;
  updateScheduledWorkout(id: string, updates: Partial<ScheduledWorkout>): Promise<ScheduledWorkout | undefined>;
  deleteScheduledWorkout(id: string): Promise<boolean>;

  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private workouts: Map<string, Workout>;
  private healthMetrics: Map<string, HealthMetrics>;
  private scheduledWorkouts: Map<string, ScheduledWorkout>;
  public sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.workouts = new Map();
    this.healthMetrics = new Map();
    this.scheduledWorkouts = new Map();
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      currentStreak: 0,
      longestStreak: 0,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Workout methods
  async getWorkoutsByUserId(userId: string): Promise<Workout[]> {
    return Array.from(this.workouts.values())
      .filter(workout => workout.userId === userId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async getWorkout(id: string): Promise<Workout | undefined> {
    return this.workouts.get(id);
  }

  async createWorkout(insertWorkout: InsertWorkout): Promise<Workout> {
    const id = randomUUID();
    const workout: Workout = { 
      ...insertWorkout, 
      id,
      createdAt: new Date()
    };
    this.workouts.set(id, workout);
    
    // Update user streak
    await this.updateUserStreak(insertWorkout.userId);
    
    return workout;
  }

  async updateWorkout(id: string, updates: Partial<Workout>): Promise<Workout | undefined> {
    const workout = this.workouts.get(id);
    if (!workout) return undefined;
    
    const updatedWorkout = { ...workout, ...updates };
    this.workouts.set(id, updatedWorkout);
    return updatedWorkout;
  }

  async deleteWorkout(id: string): Promise<boolean> {
    return this.workouts.delete(id);
  }

  // Health metrics methods
  async getHealthMetricsByUserId(userId: string): Promise<HealthMetrics[]> {
    return Array.from(this.healthMetrics.values())
      .filter(metrics => metrics.userId === userId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async getLatestHealthMetrics(userId: string): Promise<HealthMetrics | undefined> {
    const metrics = await this.getHealthMetricsByUserId(userId);
    return metrics[0];
  }

  async createHealthMetrics(insertMetrics: InsertHealthMetrics): Promise<HealthMetrics> {
    const id = randomUUID();
    const metrics: HealthMetrics = { 
      ...insertMetrics, 
      id,
      createdAt: new Date()
    };
    this.healthMetrics.set(id, metrics);
    return metrics;
  }

  // Scheduled workouts methods
  async getScheduledWorkoutsByUserId(userId: string): Promise<ScheduledWorkout[]> {
    return Array.from(this.scheduledWorkouts.values())
      .filter(workout => workout.userId === userId)
      .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());
  }

  async getScheduledWorkout(id: string): Promise<ScheduledWorkout | undefined> {
    return this.scheduledWorkouts.get(id);
  }

  async createScheduledWorkout(insertWorkout: InsertScheduledWorkout): Promise<ScheduledWorkout> {
    const id = randomUUID();
    const workout: ScheduledWorkout = { 
      ...insertWorkout, 
      id,
      completed: 0,
      createdAt: new Date()
    };
    this.scheduledWorkouts.set(id, workout);
    return workout;
  }

  async updateScheduledWorkout(id: string, updates: Partial<ScheduledWorkout>): Promise<ScheduledWorkout | undefined> {
    const workout = this.scheduledWorkouts.get(id);
    if (!workout) return undefined;
    
    const updatedWorkout = { ...workout, ...updates };
    this.scheduledWorkouts.set(id, updatedWorkout);
    return updatedWorkout;
  }

  async deleteScheduledWorkout(id: string): Promise<boolean> {
    return this.scheduledWorkouts.delete(id);
  }

  // Helper method to update user streak
  private async updateUserStreak(userId: string): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) return;

    const userWorkouts = await this.getWorkoutsByUserId(userId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate current streak
    let currentStreak = 0;
    const sortedWorkouts = userWorkouts.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
    
    for (let i = 0; i < sortedWorkouts.length; i++) {
      const workoutDate = new Date(sortedWorkouts[i].createdAt!);
      workoutDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((today.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === i) {
        currentStreak++;
      } else {
        break;
      }
    }

    const longestStreak = Math.max(user.longestStreak || 0, currentStreak);
    
    await this.updateUser(userId, { 
      currentStreak, 
      longestStreak 
    });
  }
}

export const storage = new MemStorage();
