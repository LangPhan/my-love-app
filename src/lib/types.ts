/**
 * TypeScript interfaces for the Love App
 *
 * These interfaces define the data structures used throughout the application
 * for users, couples, messages, memories, and todos.
 */

import { Models } from "appwrite";

// Base interface for all documents with Appwrite fields
export interface BaseDocument extends Models.Document {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
  $databaseId: string;
  $collectionId: string;
}

// User interface - represents individual users in the app
export interface User extends BaseDocument {
  email: string;
  name: string;
  avatar?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  bio?: string;
  coupleId?: string; // Reference to the couple they belong to
  fcmToken?: string; // For push notifications
  preferences: {
    theme: "light" | "dark" | "system";
    notifications: {
      messages: boolean;
      memories: boolean;
      todos: boolean;
      reminders: boolean;
    };
    privacy: {
      profileVisibility: "public" | "couple" | "private";
      locationSharing: boolean;
    };
  };
  isActive: boolean;
  lastSeen: string;
}

// Couple interface - represents the relationship between two users
export interface Couple extends BaseDocument {
  user1Id: string; // First user ID
  user2Id: string; // Second user ID
  relationshipStartDate: string;
  anniversaryDate?: string;
  coupleNames: {
    user1Name: string;
    user2Name: string;
  };
  status: "active" | "pending" | "inactive";
  inviteCode?: string; // For partner invitation
  settings: {
    sharedCalendar: boolean;
    locationSharing: boolean;
    photoAutoSync: boolean;
    todoNotifications: boolean;
  };
  stats: {
    totalMessages: number;
    totalMemories: number;
    totalTodos: number;
    longestStreak: number; // Days of consecutive activity
    currentStreak: number;
  };
}

// Message interface - represents chat messages between partners
export interface Message extends BaseDocument {
  coupleId: string;
  senderId: string;
  recipientId: string;
  content: string;
  type: "text" | "image" | "video" | "audio" | "location" | "sticker";
  mediaUrl?: string; // For image/video/audio messages
  mediaType?: string; // MIME type for media files
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  replyTo?: string; // ID of message being replied to
  reactions: {
    userId: string;
    emoji: string;
    timestamp: string;
  }[];
  isRead: boolean;
  readAt?: string;
  isEdited: boolean;
  editedAt?: string;
  metadata?: {
    fileSize?: number;
    duration?: number; // For audio/video
    dimensions?: {
      width: number;
      height: number;
    };
  };
}

// Memory interface - represents shared photos, videos, and moments
export interface Memory extends BaseDocument {
  coupleId: string;
  createdBy: string;
  title: string;
  description?: string;
  date: string; // Date when the memory happened
  type: "photo" | "video" | "note" | "milestone";
  mediaUrls: string[]; // Array of media file URLs
  location?: {
    latitude: number;
    longitude: number;
    address: string;
    placeName?: string;
  };
  tags: string[]; // Tags for categorization
  isPrivate: boolean;
  isFavorite: boolean;
  reactions: {
    userId: string;
    emoji: string;
    timestamp: string;
  }[];
  comments: {
    id: string;
    userId: string;
    content: string;
    timestamp: string;
  }[];
  metadata: {
    weather?: {
      temperature: number;
      condition: string;
      icon: string;
    };
    mood?:
      | "happy"
      | "romantic"
      | "excited"
      | "peaceful"
      | "adventurous"
      | "grateful";
    people?: string[]; // Names of people in the memory
  };
}

// Todo interface - represents shared tasks and goals
export interface Todo extends BaseDocument {
  coupleId: string;
  createdBy: string;
  assignedTo?: string; // User ID, if assigned to specific person
  title: string;
  description?: string;
  category:
    | "date-ideas"
    | "home"
    | "travel"
    | "goals"
    | "shopping"
    | "events"
    | "other";
  priority: "low" | "medium" | "high";
  status: "pending" | "in-progress" | "completed" | "cancelled";
  dueDate?: string;
  completedAt?: string;
  completedBy?: string;
  tags: string[];
  attachments: {
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
  }[];
  subtasks: {
    id: string;
    title: string;
    isCompleted: boolean;
    completedAt?: string;
    completedBy?: string;
  }[];
  reminders: {
    datetime: string;
    type: "notification" | "email";
    sent: boolean;
  }[];
  notes: {
    id: string;
    userId: string;
    content: string;
    timestamp: string;
  }[];
  recurringPattern?: {
    type: "daily" | "weekly" | "monthly" | "yearly";
    interval: number; // Every X days/weeks/months/years
    endDate?: string;
  };
}

// Additional utility types

// For API responses
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// For pagination
export interface PaginatedResponse<T> {
  documents: T[];
  total: number;
  offset: number;
  limit: number;
}

// For file uploads
export interface FileUpload {
  file: File;
  bucketId: string;
  fileId?: string;
  permissions?: string[];
}

// For real-time subscriptions
export interface RealtimeEvent<T = any> {
  events: string[];
  channels: string[];
  timestamp: number;
  payload: T;
}

// For user preferences and settings
export interface AppSettings {
  theme: "light" | "dark" | "system";
  language: string;
  timezone: string;
  dateFormat: "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD";
  timeFormat: "12h" | "24h";
  currency: string;
}

// For notification types
export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  data?: Record<string, any>;
  actions?: {
    action: string;
    title: string;
    icon?: string;
  }[];
}

// Form data types for various operations
export interface CreateUserData {
  email: string;
  password: string;
  name: string;
  phoneNumber?: string;
  dateOfBirth?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface CreateCoupleData {
  relationshipStartDate: string;
  anniversaryDate?: string;
  inviteCode?: string;
}

export interface CreateMessageData {
  coupleId: string;
  recipientId: string;
  content: string;
  type: Message["type"];
  mediaUrl?: string;
  location?: Message["location"];
  replyTo?: string;
}

export interface CreateMemoryData {
  title: string;
  description?: string;
  date: string;
  type: Memory["type"];
  mediaUrls?: string[];
  location?: Memory["location"];
  tags?: string[];
  isPrivate?: boolean;
}

export interface CreateTodoData {
  title: string;
  description?: string;
  category: Todo["category"];
  priority: Todo["priority"];
  dueDate?: string;
  assignedTo?: string;
  tags?: string[];
}

// Generic API response type for consistent error handling
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Paginated response type for list operations
export interface PaginatedResponse<T> {
  total: number;
  documents: T[];
  offset: number;
  limit: number;
}

// Form validation types
export interface ValidationError {
  field: string;
  message: string;
}

// All types are already exported above with their interface declarations
