"use server";

import { account, COLLECTIONS, DATABASE_ID, databases } from "@/lib/appwrite";
import { revalidatePath } from "next/cache";

/**
 * Update user profile information
 */
export async function updateUserProfile(formData: FormData) {
  try {
    const displayName = formData.get("displayName") as string;
    const avatarFileId = formData.get("avatarFileId") as string | null;

    if (!displayName?.trim()) {
      throw new Error("Display name is required");
    }

    // Get current user
    const user = await account.get();
    if (!user) {
      throw new Error("User not authenticated");
    }

    // Update user name
    await account.updateName(displayName);

    // Update user preferences with avatar file ID if provided
    if (avatarFileId) {
      await account.updatePrefs({
        ...user.prefs,
        avatarFileId,
        theme: user.prefs.theme || "system",
      });
    }

    // Also update the user document in the database if it exists
    try {
      const userDocs = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.USERS,
        [],
      );

      const userDoc = userDocs.documents.find(
        (doc) => doc.email === user.email,
      );
      if (userDoc) {
        await databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.USERS,
          userDoc.$id,
          {
            name: displayName,
            ...(avatarFileId && { avatarFileId }),
          },
        );
      }
    } catch (error) {
      console.warn("Failed to update user document:", error);
    }

    revalidatePath("/settings");
    return { success: true, message: "Profile updated successfully" };
  } catch (error: any) {
    console.error("Error updating profile:", error);
    return {
      success: false,
      error: error.message || "Failed to update profile",
    };
  }
}

/**
 * Update user theme preference
 */
export async function updateThemePreference(
  theme: "light" | "dark" | "system",
) {
  try {
    const user = await account.get();
    if (!user) {
      throw new Error("User not authenticated");
    }

    await account.updatePrefs({
      ...user.prefs,
      theme,
    });

    return { success: true, message: "Theme preference updated" };
  } catch (error: any) {
    console.error("Error updating theme:", error);
    return {
      success: false,
      error: error.message || "Failed to update theme preference",
    };
  }
}
