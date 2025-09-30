"use server";

import { account, COLLECTIONS, DATABASE_ID, databases } from "@/lib/appwrite";
import { Query } from "appwrite";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

/**
 * Regenerate couple invite code
 */
export async function regenerateInviteCode(coupleId: string) {
  try {
    // Verify user is authenticated and part of this couple
    const user = await account.get();
    if (!user) {
      throw new Error("User not authenticated");
    }

    // Get couple document to verify user has access
    const couple = await databases.getDocument(
      DATABASE_ID,
      COLLECTIONS.COUPLES,
      coupleId,
    );

    // Check if user is part of this couple
    const userDocs = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.USERS,
      [Query.equal("email", user.email)],
    );

    if (userDocs.documents.length === 0) {
      throw new Error("User document not found");
    }

    const userDoc = userDocs.documents[0];
    if (userDoc.coupleId !== coupleId) {
      throw new Error("User is not part of this couple");
    }

    // Generate new invite code
    const newInviteCode = `LOVE${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    // Update couple document with new invite code
    await databases.updateDocument(DATABASE_ID, COLLECTIONS.COUPLES, coupleId, {
      inviteCode: newInviteCode,
    });

    revalidatePath("/settings");
    return {
      success: true,
      message: "Invite code regenerated successfully",
      inviteCode: newInviteCode,
    };
  } catch (error: any) {
    console.error("Error regenerating invite code:", error);
    return {
      success: false,
      error: error.message || "Failed to regenerate invite code",
    };
  }
}

/**
 * Update couple anniversary date
 */
export async function updateAnniversaryDate(
  coupleId: string,
  anniversaryDate: string,
) {
  try {
    // Verify user is authenticated and part of this couple
    const user = await account.get();
    if (!user) {
      throw new Error("User not authenticated");
    }

    // Verify user is part of this couple
    const userDocs = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.USERS,
      [Query.equal("email", user.email)],
    );

    if (userDocs.documents.length === 0) {
      throw new Error("User document not found");
    }

    const userDoc = userDocs.documents[0];
    if (userDoc.coupleId !== coupleId) {
      throw new Error("User is not part of this couple");
    }

    // Update couple document with anniversary date
    await databases.updateDocument(DATABASE_ID, COLLECTIONS.COUPLES, coupleId, {
      anniversaryDate: new Date(anniversaryDate).toISOString(),
    });

    revalidatePath("/settings");
    return {
      success: true,
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
 * Leave couple - disconnect from partner and cleanup data
 */
export async function leaveCouple(coupleId: string) {
  try {
    // Verify user is authenticated
    const user = await account.get();
    if (!user) {
      throw new Error("User not authenticated");
    }

    // Get user document
    const userDocs = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.USERS,
      [Query.equal("email", user.email)],
    );

    if (userDocs.documents.length === 0) {
      throw new Error("User document not found");
    }

    const userDoc = userDocs.documents[0];
    if (userDoc.coupleId !== coupleId) {
      throw new Error("User is not part of this couple");
    }

    // Remove user from couple
    await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.USERS,
      userDoc.$id,
      {
        coupleId: null,
      },
    );

    // Get couple document to check if partner still exists
    const couple = await databases.getDocument(
      DATABASE_ID,
      COLLECTIONS.COUPLES,
      coupleId,
    );

    // Check if partner is still connected
    const partnerId =
      userDoc.$id === couple.user1Id ? couple.user2Id : couple.user1Id;

    if (partnerId) {
      try {
        const partnerDoc = await databases.getDocument(
          DATABASE_ID,
          COLLECTIONS.USERS,
          partnerId,
        );

        // If partner still exists, just remove current user from couple
        if (partnerDoc && partnerDoc.coupleId === coupleId) {
          // Update couple to remove this user
          const updateData =
            userDoc.$id === couple.user1Id
              ? { user1Id: null }
              : { user2Id: null };

          await databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.COUPLES,
            coupleId,
            updateData,
          );
        } else {
          // Partner is also gone, delete the couple and associated data
          await deleteCoupleData(coupleId);
        }
      } catch (error) {
        // Partner document doesn't exist, delete couple data
        await deleteCoupleData(coupleId);
      }
    } else {
      // No partner, delete couple data
      await deleteCoupleData(coupleId);
    }

    revalidatePath("/");
    redirect("/");
  } catch (error: any) {
    console.error("Error leaving couple:", error);
    return {
      success: false,
      error: error.message || "Failed to leave couple",
    };
  }
}

/**
 * Helper function to delete couple and associated data
 */
async function deleteCoupleData(coupleId: string) {
  try {
    // Delete memories associated with this couple
    const memories = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.MEMORIES,
      [Query.equal("coupleId", coupleId)],
    );

    for (const memory of memories.documents) {
      await databases.deleteDocument(
        DATABASE_ID,
        COLLECTIONS.MEMORIES,
        memory.$id,
      );
    }

    // Delete messages associated with this couple
    const messages = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.MESSAGES,
      [Query.equal("coupleId", coupleId)],
    );

    for (const message of messages.documents) {
      await databases.deleteDocument(
        DATABASE_ID,
        COLLECTIONS.MESSAGES,
        message.$id,
      );
    }

    // Delete todos associated with this couple
    const todos = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.TODOS,
      [Query.equal("coupleId", coupleId)],
    );

    for (const todo of todos.documents) {
      await databases.deleteDocument(DATABASE_ID, COLLECTIONS.TODOS, todo.$id);
    }

    // Finally, delete the couple document
    await databases.deleteDocument(DATABASE_ID, COLLECTIONS.COUPLES, coupleId);

    console.log("Couple data deleted successfully");
  } catch (error) {
    console.error("Error deleting couple data:", error);
    throw error;
  }
}
