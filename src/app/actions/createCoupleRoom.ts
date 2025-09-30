"use server";

import { COLLECTIONS, DATABASE_ID, databases } from "@/lib/appwrite";
import { ID, Permission, Role } from "appwrite";

export interface CreateCoupleRoomData {
  userId: string;
  inviteCode?: string;
  displayName: string;
}

export interface CoupleRoomResult {
  success: boolean;
  coupleId?: string;
  error?: string;
  isCreator?: boolean;
}

/**
 * Create or join a couple room based on invite code
 * If no invite code is provided, creates a new couple room
 * If invite code is provided, tries to join existing couple room
 */
export async function createCoupleRoom(
  data: CreateCoupleRoomData,
): Promise<CoupleRoomResult> {
  try {
    const { userId, inviteCode, displayName } = data;

    if (inviteCode) {
      // Try to join an existing couple room
      try {
        // Find couple by invite code
        const couples = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.COUPLES,
          [
            // Query for couples with matching invite code and only one user
            `inviteCode=${inviteCode}`,
            'user2Id=""', // Looking for couples that need a second user
          ],
        );

        if (couples.documents.length > 0) {
          const couple = couples.documents[0];

          // Update the couple document to add the second user
          const updatedCouple = await databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.COUPLES,
            couple.$id,
            {
              user2Id: userId,
              user2Name: displayName,
              status: "active",
              connectedAt: new Date().toISOString(),
            },
            [
              Permission.read(Role.user(couple.user1Id)),
              Permission.read(Role.user(userId)),
              Permission.update(Role.user(couple.user1Id)),
              Permission.update(Role.user(userId)),
              Permission.delete(Role.user(couple.user1Id)),
              Permission.delete(Role.user(userId)),
            ],
          );

          // Update user document to reference the couple
          await databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.USERS,
            userId,
            {
              coupleId: couple.$id,
            },
          );

          return {
            success: true,
            coupleId: couple.$id,
            isCreator: false,
          };
        } else {
          return {
            success: false,
            error: "Invalid or expired invite code",
          };
        }
      } catch (error) {
        console.error("Error joining couple room:", error);
        return {
          success: false,
          error: "Failed to join couple room",
        };
      }
    } else {
      // Create a new couple room
      try {
        const inviteCode = generateInviteCode();

        const couple = await databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.COUPLES,
          ID.unique(),
          {
            user1Id: userId,
            user1Name: displayName,
            user2Id: "",
            user2Name: "",
            inviteCode: inviteCode,
            status: "waiting", // waiting for partner to join
            createdAt: new Date().toISOString(),
            anniversaryDate: null,
            relationshipStatus: "dating",
            sharedPreferences: {
              theme: "system",
              notifications: true,
              autoBackup: true,
            },
          },
          [
            Permission.read(Role.user(userId)),
            Permission.update(Role.user(userId)),
            Permission.delete(Role.user(userId)),
          ],
        );

        // Update user document to reference the couple
        await databases.updateDocument(DATABASE_ID, COLLECTIONS.USERS, userId, {
          coupleId: couple.$id,
        });

        return {
          success: true,
          coupleId: couple.$id,
          isCreator: true,
        };
      } catch (error) {
        console.error("Error creating couple room:", error);
        return {
          success: false,
          error: "Failed to create couple room",
        };
      }
    }
  } catch (error) {
    console.error("Error in createCoupleRoom:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

/**
 * Generate a unique 6-character invite code
 */
function generateInviteCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Get couple information by invite code
 */
export async function getCoupleByInviteCode(inviteCode: string) {
  try {
    const couples = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.COUPLES,
      [`inviteCode=${inviteCode}`],
    );

    if (couples.documents.length > 0) {
      return {
        success: true,
        data: couples.documents[0],
      };
    }

    return {
      success: false,
      error: "Couple not found",
    };
  } catch (error) {
    console.error("Error getting couple by invite code:", error);
    return {
      success: false,
      error: "Failed to find couple",
    };
  }
}
