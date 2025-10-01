/**
 * Appwrite Client Configuration and Helper Functions
 *
 * This file initializes the Appwrite client and provides typed helper functions
 * for authentication, database operations, and file management.
 */

import {
  Account,
  Client,
  Databases,
  ID,
  ImageFormat,
  ImageGravity,
  Models,
  Permission,
  Query,
  Role,
  Storage,
} from "appwrite";
import type {
  ApiResponse,
  CreateUserData,
  LoginData,
  PaginatedResponse,
} from "./types";

// Environment variables validation
const requiredEnvVars = {
  endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT,
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
};

// Validate required environment variables
Object.entries(requiredEnvVars).forEach(([key, value]) => {
  if (!value) {
    throw new Error(
      `Missing required environment variable: NEXT_PUBLIC_APPWRITE_${key.toUpperCase()}`,
    );
  }
});

// Initialize Appwrite client
export const client = new Client()
  .setEndpoint(requiredEnvVars.endpoint!)
  .setProject(requiredEnvVars.projectId!);

// Initialize Appwrite services
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

// Database and collection IDs from environment variables
export const DATABASE_ID = process.env.NEXT_PUBLIC_DATABASE_ID || "love_app_db";
export const COLLECTIONS = {
  USERS: process.env.NEXT_PUBLIC_USERS_COLLECTION_ID || "users",
  COUPLES: process.env.NEXT_PUBLIC_COUPLES_COLLECTION_ID || "couples",
  MESSAGES: process.env.NEXT_PUBLIC_MESSAGES_COLLECTION_ID || "messages",
  MEMORIES: process.env.NEXT_PUBLIC_MEMORIES_COLLECTION_ID || "memories",
  TODOS: process.env.NEXT_PUBLIC_TODOS_COLLECTION_ID || "todos",
} as const;

// Storage bucket IDs
export const BUCKETS = {
  MEMORIES: process.env.NEXT_PUBLIC_MEMORIES_BUCKET_ID || "memories_bucket",
  AVATARS: process.env.NEXT_PUBLIC_AVATARS_BUCKET_ID || "avatars_bucket",
  MESSAGES: process.env.NEXT_PUBLIC_MESSAGES_BUCKET_ID || "messages_bucket",
} as const;

// TODO: Server-only functions requiring admin API key
// These functions should be implemented in API routes with server-side Appwrite client
// using APPWRITE_API_KEY environment variable for admin operations:
//
// Server-only operations needed:
// - createUserDocument(userId: string, userData: Partial<User>): Create user profile document
// - createCouple(user1Id: string, user2Id: string): Create couple relationship
// - sendPushNotification(userId: string, payload: NotificationPayload): Send push notifications
// - deleteUserAccount(userId: string): Delete user and all associated data
// - moderateContent(documentId: string, action: 'approve' | 'reject'): Content moderation
// - generateCoupleInviteCode(): Generate unique invite codes
// - processFileUploads(fileId: string): Process and optimize uploaded files
// - backupUserData(userId: string): Export user data for backup
// - updateUserSubscription(userId: string, plan: string): Manage subscriptions

/**
 * Authentication Functions
 */

/**
 * Create a new user account
 */
export async function createUser(
  userData: CreateUserData,
): Promise<ApiResponse<Models.User<Models.Preferences>>> {
  try {
    const user = await account.create(
      ID.unique(),
      userData.email,
      userData.password,
      userData.name,
    );

    // TODO: After account creation, call server-side API to create user profile document
    // This requires server-side implementation with admin privileges

    return {
      success: true,
      data: user,
      message: "Account created successfully",
    };
  } catch (error: any) {
    console.error("Error creating user:", error);
    return {
      success: false,
      error: error.message || "Failed to create account",
    };
  }
}

/**
 * Login user with email and password
 */
export async function login(
  loginData: LoginData,
): Promise<ApiResponse<Models.Session>> {
  try {
    const session = await account.createEmailPasswordSession(
      loginData.email,
      loginData.password,
    );

    return {
      success: true,
      data: session,
      message: "Login successful",
    };
  } catch (error: any) {
    console.error("Error logging in:", error);
    return {
      success: false,
      error: error.message || "Login failed",
    };
  }
}

/**
 * Get current logged-in user
 */
export async function getCurrentUser(): Promise<
  ApiResponse<Models.User<Models.Preferences>>
> {
  try {
    const user = await account.get();
    return {
      success: true,
      data: user,
    };
  } catch (error: any) {
    console.error("Error getting current user:", error);
    return {
      success: false,
      error: error.message || "Failed to get user information",
    };
  }
}

/**
 * Logout current user
 */
export async function logout(): Promise<ApiResponse<{}>> {
  try {
    await account.deleteSession("current");
    return {
      success: true,
      message: "Logout successful",
    };
  } catch (error: any) {
    console.error("Error logging out:", error);
    return {
      success: false,
      error: error.message || "Logout failed",
    };
  }
}

/**
 * Update user password
 */
export async function updatePassword(
  oldPassword: string,
  newPassword: string,
): Promise<ApiResponse<Models.User<Models.Preferences>>> {
  try {
    const user = await account.updatePassword(newPassword, oldPassword);
    return {
      success: true,
      data: user,
      message: "Password updated successfully",
    };
  } catch (error: any) {
    console.error("Error updating password:", error);
    return {
      success: false,
      error: error.message || "Failed to update password",
    };
  }
}

/**
 * File Upload Functions
 */

/**
 * Upload a file to Appwrite storage
 */
export async function uploadFile(
  file: File,
  bucketId: string = BUCKETS.MEMORIES,
  fileId?: string,
  permissions?: string[],
): Promise<ApiResponse<Models.File>> {
  try {
    const uploadedFile = await storage.createFile(
      bucketId,
      fileId || ID.unique(),
      file,
      permissions,
    );

    return {
      success: true,
      data: uploadedFile,
      message: "File uploaded successfully",
    };
  } catch (error: any) {
    console.error("Error uploading file:", error);
    return {
      success: false,
      error: error.message || "File upload failed",
    };
  }
}

/**
 * Get file preview URL
 */
export function getFilePreview(
  bucketId: string,
  fileId: string,
  width?: number,
  height?: number,
  gravity?: ImageGravity,
  quality?: number,
  borderWidth?: number,
  borderColor?: string,
  borderRadius?: number,
  opacity?: number,
  rotation?: number,
  background?: string,
  output?: ImageFormat,
): string {
  return storage
    .getFilePreview(
      bucketId,
      fileId,
      width,
      height,
      gravity,
      quality,
      borderWidth,
      borderColor,
      borderRadius,
      opacity,
      rotation,
      background,
      output,
    )
    .toString();
}

/**
 * Get file download URL
 */
export function getFileDownload(bucketId: string, fileId: string): string {
  return storage.getFileDownload(bucketId, fileId).toString();
}

/**
 * Delete a file
 */
export async function deleteFile(
  bucketId: string,
  fileId: string,
): Promise<ApiResponse<{}>> {
  try {
    await storage.deleteFile(bucketId, fileId);
    return {
      success: true,
      message: "File deleted successfully",
    };
  } catch (error: any) {
    console.error("Error deleting file:", error);
    return {
      success: false,
      error: error.message || "Failed to delete file",
    };
  }
}

/**
 * Database Functions
 */

/**
 * Create a document in a collection
 */
export async function createDocument<T = any>(
  collectionId: string,
  data: Omit<T, keyof Models.Document>,
  documentId?: string,
  permissions?: string[],
): Promise<ApiResponse<T & Models.Document>> {
  try {
    const document = await databases.createDocument(
      DATABASE_ID,
      collectionId,
      documentId || ID.unique(),
      data,
      permissions,
    );

    return {
      success: true,
      data: document as T & Models.Document,
      message: "Document created successfully",
    };
  } catch (error: any) {
    console.error("Error creating document:", error);
    return {
      success: false,
      error: error.message || "Failed to create document",
    };
  }
}

/**
 * Get a document by ID
 */
export async function getDocument<T = any>(
  collectionId: string,
  documentId: string,
  queries?: string[],
): Promise<ApiResponse<T & Models.Document>> {
  try {
    const document = await databases.getDocument(
      DATABASE_ID,
      collectionId,
      documentId,
      queries,
    );

    return {
      success: true,
      data: document as unknown as T & Models.Document,
    };
  } catch (error: any) {
    console.error("Error getting document:", error);
    return {
      success: false,
      error: error.message || "Failed to get document",
    };
  }
}

/**
 * List documents in a collection with optional queries
 */
export async function listDocuments<T = any>(
  collectionId: string,
  queries?: string[],
): Promise<ApiResponse<PaginatedResponse<T & Models.Document>>> {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      collectionId,
      queries,
    );

    return {
      success: true,
      data: {
        documents: response.documents as unknown as (T & Models.Document)[],
        total: response.total,
        offset: 0,
        limit: response.documents.length,
      },
    };
  } catch (error: any) {
    console.error("Error listing documents:", error);
    return {
      success: false,
      error: error.message || "Failed to list documents",
    };
  }
}

/**
 * Update a document
 */
export async function updateDocument<T = any>(
  collectionId: string,
  documentId: string,
  data: Partial<Omit<T, keyof Models.Document>>,
  permissions?: string[],
): Promise<ApiResponse<T & Models.Document>> {
  try {
    const document = await databases.updateDocument(
      DATABASE_ID,
      collectionId,
      documentId,
      data,
      permissions,
    );

    return {
      success: true,
      data: document as T & Models.Document,
      message: "Document updated successfully",
    };
  } catch (error: any) {
    console.error("Error updating document:", error);
    return {
      success: false,
      error: error.message || "Failed to update document",
    };
  }
}

/**
 * Delete a document
 */
export async function deleteDocument(
  collectionId: string,
  documentId: string,
): Promise<ApiResponse<{}>> {
  try {
    await databases.deleteDocument(DATABASE_ID, collectionId, documentId);
    return {
      success: true,
      message: "Document deleted successfully",
    };
  } catch (error: any) {
    console.error("Error deleting document:", error);
    return {
      success: false,
      error: error.message || "Failed to delete document",
    };
  }
}

/**
 * Query Helpers
 */

// Re-export Appwrite Query helpers for easy access
export { ID, Permission, Query, Role };

/**
 * Real-time Subscriptions
 */

/**
 * Subscribe to real-time updates
 */
export function subscribeToCollection(
  collectionId: string,
  callback: (payload: any) => void,
) {
  const channel = `databases.${DATABASE_ID}.collections.${collectionId}.documents`;

  return client.subscribe(channel, callback);
}

/**
 * Subscribe to specific document updates
 */
export function subscribeToDocument(
  collectionId: string,
  documentId: string,
  callback: (payload: any) => void,
) {
  const channel = `databases.${DATABASE_ID}.collections.${collectionId}.documents.${documentId}`;

  return client.subscribe(channel, callback);
}

/**
 * Utility Functions
 */

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    await account.get();
    return true;
  } catch {
    return false;
  }
}

/**
 * Generate default permissions for user documents
 */
export function getUserPermissions(userId: string): string[] {
  return [
    Permission.read(Role.user(userId)),
    Permission.write(Role.user(userId)),
    Permission.update(Role.user(userId)),
    Permission.delete(Role.user(userId)),
  ];
}

/**
 * Generate permissions for couple documents (both users can access)
 */
export function getCouplePermissions(
  user1Id: string,
  user2Id: string,
): string[] {
  return [
    Permission.read(Role.user(user1Id)),
    Permission.write(Role.user(user1Id)),
    Permission.update(Role.user(user1Id)),
    Permission.read(Role.user(user2Id)),
    Permission.write(Role.user(user2Id)),
    Permission.update(Role.user(user2Id)),
  ];
}

/**
 * Error handling helper
 */
export function handleAppwriteError(error: any): string {
  if (error?.code) {
    switch (error.code) {
      case 401:
        return "Authentication required. Please log in.";
      case 403:
        return "Access denied. You don't have permission to perform this action.";
      case 404:
        return "Resource not found.";
      case 409:
        return "A conflict occurred. The resource may already exist.";
      case 429:
        return "Too many requests. Please try again later.";
      case 500:
        return "Server error. Please try again later.";
      default:
        return error.message || "An unexpected error occurred.";
    }
  }
  return error.message || "An unexpected error occurred.";
}

/**
 * Couple Management Functions
 */

/**
 * Get couple information for the current user
 */
export async function getCoupleInfo(userId: string): Promise<ApiResponse<any>> {
  try {
    // First get the current user to get their email
    const currentUser = await getCurrentUser();
    if (!currentUser.success || !currentUser.data) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }

    // Query the user document by email
    const userQuery = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.USERS,
      [Query.equal("email", currentUser.data.email)],
    );

    if (userQuery.documents.length === 0) {
      return {
        success: false,
        error: "User profile not found in database",
      };
    }

    const userDoc = userQuery.documents[0];

    if (!userDoc.coupleId) {
      return {
        success: false,
        error: "User is not part of a couple",
      };
    }

    // Get the couple document
    const coupleDoc = await databases.getDocument(
      DATABASE_ID,
      COLLECTIONS.COUPLES,
      userDoc.coupleId,
    );

    // Calculate days together
    // Use anniversaryDate if available (more meaningful), otherwise use when couple was created
    let startDate: Date;
    if (coupleDoc.anniversaryDate) {
      startDate = new Date(coupleDoc.anniversaryDate);
    } else {
      startDate = new Date(coupleDoc.$createdAt);
    }

    const today = new Date();

    // Ensure we have valid dates
    if (isNaN(startDate.getTime()) || isNaN(today.getTime())) {
      console.error("Invalid date detected:", { startDate, today, coupleDoc });
      return {
        success: false,
        error: "Invalid date information",
      };
    }

    const daysTogether = Math.floor(
      (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    // Get partner information
    const partnerId =
      userDoc.$id === coupleDoc.user1Id ? coupleDoc.user2Id : coupleDoc.user1Id;
    let partnerName = "Partner";

    if (partnerId) {
      try {
        const partnerDoc = await databases.getDocument(
          DATABASE_ID,
          COLLECTIONS.USERS,
          partnerId,
        );
        partnerName = partnerDoc.name || "Partner";
      } catch (error) {
        console.error("Error getting partner info:", error);
      }
    }

    // Calculate next anniversary (if anniversary date is set)
    let nextAnniversary = null;
    if (coupleDoc.anniversaryDate) {
      const annivDate = new Date(coupleDoc.anniversaryDate);
      const currentYear = today.getFullYear();
      let nextAnnivDate = new Date(
        currentYear,
        annivDate.getMonth(),
        annivDate.getDate(),
      );

      // If this year's anniversary has passed, use next year's
      if (nextAnnivDate < today) {
        nextAnnivDate = new Date(
          currentYear + 1,
          annivDate.getMonth(),
          annivDate.getDate(),
        );
      }

      const daysUntilAnniversary = Math.ceil(
        (nextAnnivDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
      );
      nextAnniversary = {
        date: nextAnnivDate.toISOString(),
        daysUntil: daysUntilAnniversary,
      };
    }

    return {
      success: true,
      data: {
        couple: coupleDoc,
        daysTogether,
        nextAnniversary,
        partnerName,
      },
    };
  } catch (error: any) {
    console.error("Error getting couple info:", error);
    return {
      success: false,
      error: error.message || "Failed to get couple information",
    };
  }
}

/**
 * Update couple anniversary date
 */
export async function updateAnniversaryDate(
  coupleId: string,
  anniversaryDate: string,
): Promise<ApiResponse<any>> {
  try {
    const updatedCouple = await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.COUPLES,
      coupleId,
      {
        anniversaryDate,
      },
    );

    return {
      success: true,
      data: updatedCouple,
      message: "Anniversary date updated successfully",
    };
  } catch (error: any) {
    console.error("Error updating anniversary date:", error);
    return {
      success: false,
      error: error.message || "Failed to update anniversary date",
    };
  }
}

/**
 * Update user profile name
 */
export async function updateUserName(name: string): Promise<ApiResponse<any>> {
  try {
    const updatedUser = await account.updateName(name);

    return {
      success: true,
      data: updatedUser,
      message: "User name updated successfully",
    };
  } catch (error: any) {
    console.error("Error updating user name:", error);
    return {
      success: false,
      error: error.message || "Failed to update user name",
    };
  }
}

/**
 * Update user preferences
 */
export async function updateUserPrefs(
  prefs: Record<string, any>,
): Promise<ApiResponse<any>> {
  try {
    const updatedUser = await account.updatePrefs(prefs);

    return {
      success: true,
      data: updatedUser,
      message: "User preferences updated successfully",
    };
  } catch (error: any) {
    console.error("Error updating user preferences:", error);
    return {
      success: false,
      error: error.message || "Failed to update user preferences",
    };
  }
}
