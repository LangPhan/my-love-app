/**
 * Todo Management Functions
 *
 * This file provides functions for managing todos in the love app,
 * including creating, updating, deleting, and fetching todos with
 * real-time subscription support.
 */

import { ID, Query } from "appwrite";
import { COLLECTIONS, DATABASE_ID, databases } from "./appwrite";
import type {
  ApiResponse,
  CreateTodoData,
  PaginatedResponse,
  Todo,
} from "./types";

/**
 * Create a new todo
 */
export async function createTodo(
  todoData: CreateTodoData & { coupleId: string; createdBy: string },
): Promise<ApiResponse<Todo>> {
  try {
    // Only send fields that exist in the database schema
    const documentData = {
      coupleId: todoData.coupleId,
      title: todoData.title.trim(),
      description: todoData.description?.trim() || "",
      isCompleted: false,
      assignedTo: todoData.assignedTo || null,
      dueDate: todoData.dueDate || null,
      priority: todoData.priority || "low", // Default to low if not specified
    };

    const todo = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.TODOS,
      ID.unique(),
      documentData,
    );

    return {
      success: true,
      data: todo as unknown as Todo,
      message: "Todo created successfully",
    };
  } catch (error) {
    console.error("Error creating todo:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create todo",
    };
  }
}

/**
 * Toggle todo completion status
 */
export async function toggleTodo(
  todoId: string,
  userId: string,
): Promise<ApiResponse<Todo>> {
  try {
    // First, get the current todo to check its completion status
    const currentTodo = (await databases.getDocument(
      DATABASE_ID,
      COLLECTIONS.TODOS,
      todoId,
    )) as any;

    const isCompleted = currentTodo.isCompleted;
    const newIsCompleted = !isCompleted;

    const updateData = {
      isCompleted: newIsCompleted,
    };

    const updatedTodo = await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.TODOS,
      todoId,
      updateData,
    );

    return {
      success: true,
      data: updatedTodo as unknown as Todo,
      message: `Todo ${newIsCompleted ? "completed" : "reopened"} successfully`,
    };
  } catch (error) {
    console.error("Error toggling todo:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to toggle todo",
    };
  }
}

/**
 * Delete a todo
 */
export async function deleteTodo(todoId: string): Promise<ApiResponse<void>> {
  try {
    await databases.deleteDocument(DATABASE_ID, COLLECTIONS.TODOS, todoId);

    return {
      success: true,
      message: "Todo deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting todo:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete todo",
    };
  }
}

/**
 * Update a todo
 */
export async function updateTodo(
  todoId: string,
  updates: Partial<Todo>,
): Promise<ApiResponse<Todo>> {
  try {
    const updatedTodo = await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.TODOS,
      todoId,
      updates as any,
    );

    return {
      success: true,
      data: updatedTodo as unknown as Todo,
      message: "Todo updated successfully",
    };
  } catch (error) {
    console.error("Error updating todo:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update todo",
    };
  }
}

/**
 * Fetch todos for a specific couple
 */
export async function fetchTodosByCouple(
  coupleId: string,
  options: {
    limit?: number;
    offset?: number;
    orderBy?: "$createdAt" | "dueDate" | "priority" | "title";
    orderDirection?: "asc" | "desc";
    isCompleted?: boolean;
    assignedTo?: string;
  } = {},
): Promise<ApiResponse<PaginatedResponse<Todo>>> {
  try {
    const {
      limit = 50,
      offset = 0,
      orderBy = "$createdAt",
      orderDirection = "desc",
      isCompleted,
      assignedTo,
    } = options;

    // Build queries
    const queries = [
      Query.equal("coupleId", coupleId),
      Query.limit(limit),
      Query.offset(offset),
      Query.orderDesc(orderBy),
    ];

    // Apply ordering
    if (orderDirection === "asc") {
      queries[queries.length - 1] = Query.orderAsc(orderBy);
    }

    // Add filters
    if (typeof isCompleted === "boolean") {
      queries.push(Query.equal("isCompleted", isCompleted));
    }
    if (assignedTo) {
      queries.push(Query.equal("assignedTo", assignedTo));
    }

    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.TODOS,
      queries,
    );

    return {
      success: true,
      data: {
        documents: response.documents as unknown as Todo[],
        total: response.total,
        offset,
        limit,
      },
    };
  } catch (error) {
    console.error("Error fetching todos:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch todos",
    };
  }
}

/**
 * Fetch a single todo by ID
 */
export async function fetchTodoById(
  todoId: string,
): Promise<ApiResponse<Todo>> {
  try {
    const todo = await databases.getDocument(
      DATABASE_ID,
      COLLECTIONS.TODOS,
      todoId,
    );

    return {
      success: true,
      data: todo as unknown as Todo,
    };
  } catch (error) {
    console.error("Error fetching todo:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch todo",
    };
  }
}

/**
 * Add a subtask to a todo (NOT SUPPORTED - Database schema doesn't include subtasks)
 */
export async function addSubtask(
  todoId: string,
  subtaskTitle: string,
): Promise<ApiResponse<Todo>> {
  return {
    success: false,
    error: "Subtasks are not supported by the current database schema",
  };
}

/**
 * Toggle subtask completion (NOT SUPPORTED - Database schema doesn't include subtasks)
 */
export async function toggleSubtask(
  todoId: string,
  subtaskId: string,
  userId: string,
): Promise<ApiResponse<Todo>> {
  return {
    success: false,
    error: "Subtasks are not supported by the current database schema",
  };
}

/**
 * Add a note to a todo (NOT SUPPORTED - Database schema doesn't include notes)
 */
export async function addTodoNote(
  todoId: string,
  content: string,
  userId: string,
): Promise<ApiResponse<Todo>> {
  return {
    success: false,
    error: "Notes are not supported by the current database schema",
  };
}

/**
 * Get todo statistics for a couple
 */
export async function getTodoStats(coupleId: string): Promise<
  ApiResponse<{
    total: number;
    completed: number;
    pending: number;
    inProgress: number;
    overdue: number;
    completionRate: number;
  }>
> {
  try {
    const allTodos = await fetchTodosByCouple(coupleId, { limit: 1000 });

    if (!allTodos.success || !allTodos.data) {
      throw new Error("Failed to fetch todos for stats");
    }

    const todos = allTodos.data.documents;
    const now = new Date();

    const stats = {
      total: todos.length,
      completed: todos.filter((todo) => (todo as any).isCompleted).length,
      pending: todos.filter((todo) => !(todo as any).isCompleted).length,
      inProgress: 0, // Not supported in current schema
      overdue: todos.filter(
        (todo) =>
          todo.dueDate &&
          new Date(todo.dueDate) < now &&
          !(todo as any).isCompleted,
      ).length,
      completionRate:
        todos.length > 0
          ? Math.round(
              (todos.filter((todo) => (todo as any).isCompleted).length /
                todos.length) *
                100,
            )
          : 0,
    };

    return {
      success: true,
      data: stats,
    };
  } catch (error) {
    console.error("Error getting todo stats:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to get todo stats",
    };
  }
}

/**
 * Subscribe to real-time todo updates for a couple
 * This function returns the subscription channel string for use with Appwrite's realtime
 */
export function getTodoSubscriptionChannel(coupleId: string): string {
  return `databases.${DATABASE_ID}.collections.${COLLECTIONS.TODOS}.documents`;
}

/**
 * Filter real-time events to only include todos for a specific couple
 */
export function filterTodoRealtimeEvent(event: any, coupleId: string): boolean {
  return event.payload?.coupleId === coupleId;
}
