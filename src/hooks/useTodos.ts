/**
 * Todos Hook with Real-time Updates
 *
 * This hook provides real-time todo management functionality including
 * fetching, creating, updating, deleting todos with Appwrite realtime subscriptions.
 */

import { client } from "@/lib/appwrite";
import {
  addSubtask,
  addTodoNote,
  createTodo,
  deleteTodo,
  fetchTodosByCouple,
  filterTodoRealtimeEvent,
  getTodoStats,
  getTodoSubscriptionChannel,
  toggleSubtask,
  toggleTodo,
  updateTodo,
} from "@/lib/todos";
import type { CreateTodoData, RealtimeEvent, Todo } from "@/lib/types";
import { useCallback, useEffect, useMemo, useState } from "react";

interface UseTodosOptions {
  coupleId: string;
  autoFetch?: boolean;
  limit?: number;
  orderBy?: "$createdAt" | "dueDate" | "priority" | "title";
  orderDirection?: "asc" | "desc";
  isCompleted?: boolean;
  assignedTo?: string;
}

interface UseTodosReturn {
  // Data
  todos: Todo[];
  stats: {
    total: number;
    completed: number;
    pending: number;
    inProgress: number;
    overdue: number;
    completionRate: number;
  } | null;

  // State
  loading: boolean;
  error: string | null;
  creating: boolean;
  updating: boolean;
  deleting: boolean;

  // Actions
  refetch: () => Promise<void>;
  createTodoAction: (
    todoData: CreateTodoData & { createdBy: string },
  ) => Promise<boolean>;
  toggleTodoAction: (todoId: string, userId: string) => Promise<boolean>;
  deleteTodoAction: (todoId: string) => Promise<boolean>;
  updateTodoAction: (
    todoId: string,
    updates: Partial<Todo>,
  ) => Promise<boolean>;
  addSubtaskAction: (todoId: string, subtaskTitle: string) => Promise<boolean>;
  toggleSubtaskAction: (
    todoId: string,
    subtaskId: string,
    userId: string,
  ) => Promise<boolean>;
  addNoteAction: (
    todoId: string,
    content: string,
    userId: string,
  ) => Promise<boolean>;

  // Filtered data
  pendingTodos: Todo[];
  completedTodos: Todo[];
  overdueTodos: Todo[];
  todayTodos: Todo[];

  // Utility
  getTodoById: (todoId: string) => Todo | undefined;
  refreshStats: () => Promise<void>;
}

export function useTodos(options: UseTodosOptions): UseTodosReturn {
  const {
    coupleId,
    autoFetch = true,
    limit = 50,
    orderBy = "$createdAt",
    orderDirection = "desc",
    isCompleted,
    assignedTo,
  } = options;

  // State
  const [todos, setTodos] = useState<Todo[]>([]);
  const [stats, setStats] = useState<UseTodosReturn["stats"]>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Fetch todos
  const fetchTodos = useCallback(async () => {
    if (!coupleId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetchTodosByCouple(coupleId, {
        limit,
        orderBy,
        orderDirection,
        isCompleted,
        assignedTo,
      });

      if (response.success && response.data) {
        setTodos(response.data.documents);
      } else {
        setError(response.error || "Failed to fetch todos");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [coupleId, limit, orderBy, orderDirection, isCompleted, assignedTo]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    if (!coupleId) return;

    try {
      const response = await getTodoStats(coupleId);
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch todo stats:", err);
    }
  }, [coupleId]);

  // Real-time subscription
  useEffect(() => {
    if (!coupleId) return;

    let unsubscribe: (() => void) | null = null;

    try {
      const channel = getTodoSubscriptionChannel(coupleId);

      unsubscribe = client.subscribe(channel, (response: RealtimeEvent) => {
        try {
          // Filter events for this couple
          if (!filterTodoRealtimeEvent(response, coupleId)) return;

          const { events, payload } = response;
          const todo = payload as Todo;

          // Handle different event types
          if (events.includes("databases.*.collections.*.documents.*.create")) {
            setTodos((prev) => [todo, ...prev]);
            fetchStats(); // Refresh stats
          } else if (
            events.includes("databases.*.collections.*.documents.*.update")
          ) {
            setTodos((prev) =>
              prev.map((t) => (t.$id === todo.$id ? todo : t)),
            );
            fetchStats(); // Refresh stats
          } else if (
            events.includes("databases.*.collections.*.documents.*.delete")
          ) {
            setTodos((prev) => prev.filter((t) => t.$id !== payload.$id));
            fetchStats(); // Refresh stats
          }
        } catch (err) {
          console.error("Error handling real-time todo event:", err);
        }
      });
    } catch (err) {
      console.error("Failed to set up real-time subscription:", err);
      // Continue without real-time updates
    }

    return () => {
      if (unsubscribe) {
        try {
          unsubscribe();
        } catch (err) {
          console.error("Error unsubscribing from real-time updates:", err);
        }
      }
    };
  }, [coupleId, fetchStats]);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchTodos();
      fetchStats();
    }
  }, [autoFetch, fetchTodos, fetchStats]);

  // Actions
  const createTodoAction = useCallback(
    async (
      todoData: CreateTodoData & { createdBy: string },
    ): Promise<boolean> => {
      setCreating(true);
      setError(null);

      try {
        const response = await createTodo({ ...todoData, coupleId });

        if (response.success) {
          // Real-time will handle the update
          return true;
        } else {
          setError(response.error || "Failed to create todo");
          return false;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        return false;
      } finally {
        setCreating(false);
      }
    },
    [coupleId],
  );

  const toggleTodoAction = useCallback(
    async (todoId: string, userId: string): Promise<boolean> => {
      setUpdating(true);
      setError(null);

      try {
        const response = await toggleTodo(todoId, userId);

        if (response.success) {
          // Real-time will handle the update
          return true;
        } else {
          setError(response.error || "Failed to toggle todo");
          return false;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        return false;
      } finally {
        setUpdating(false);
      }
    },
    [],
  );

  const deleteTodoAction = useCallback(
    async (todoId: string): Promise<boolean> => {
      setDeleting(true);
      setError(null);

      try {
        const response = await deleteTodo(todoId);

        if (response.success) {
          // Real-time will handle the update
          return true;
        } else {
          setError(response.error || "Failed to delete todo");
          return false;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        return false;
      } finally {
        setDeleting(false);
      }
    },
    [],
  );

  const updateTodoAction = useCallback(
    async (todoId: string, updates: Partial<Todo>): Promise<boolean> => {
      setUpdating(true);
      setError(null);

      try {
        const response = await updateTodo(todoId, updates);

        if (response.success) {
          // Real-time will handle the update
          return true;
        } else {
          setError(response.error || "Failed to update todo");
          return false;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        return false;
      } finally {
        setUpdating(false);
      }
    },
    [],
  );

  const addSubtaskAction = useCallback(
    async (todoId: string, subtaskTitle: string): Promise<boolean> => {
      setUpdating(true);
      setError(null);

      try {
        const response = await addSubtask(todoId, subtaskTitle);

        if (response.success) {
          return true;
        } else {
          setError(response.error || "Failed to add subtask");
          return false;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        return false;
      } finally {
        setUpdating(false);
      }
    },
    [],
  );

  const toggleSubtaskAction = useCallback(
    async (
      todoId: string,
      subtaskId: string,
      userId: string,
    ): Promise<boolean> => {
      setUpdating(true);
      setError(null);

      try {
        const response = await toggleSubtask(todoId, subtaskId, userId);

        if (response.success) {
          return true;
        } else {
          setError(response.error || "Failed to toggle subtask");
          return false;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        return false;
      } finally {
        setUpdating(false);
      }
    },
    [],
  );

  const addNoteAction = useCallback(
    async (
      todoId: string,
      content: string,
      userId: string,
    ): Promise<boolean> => {
      setUpdating(true);
      setError(null);

      try {
        const response = await addTodoNote(todoId, content, userId);

        if (response.success) {
          return true;
        } else {
          setError(response.error || "Failed to add note");
          return false;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        return false;
      } finally {
        setUpdating(false);
      }
    },
    [],
  );

  // Filtered data
  const pendingTodos = useMemo(
    () => todos.filter((todo) => !(todo as any).isCompleted),
    [todos],
  );

  const completedTodos = useMemo(
    () => todos.filter((todo) => (todo as any).isCompleted),
    [todos],
  );

  const overdueTodos = useMemo(() => {
    const now = new Date();
    return todos.filter(
      (todo) =>
        todo.dueDate &&
        new Date(todo.dueDate) < now &&
        !(todo as any).isCompleted,
    );
  }, [todos]);

  const todayTodos = useMemo(() => {
    const today = new Date();
    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const todayEnd = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1,
    );

    return todos.filter((todo) => {
      if (!todo.dueDate) return false;
      const dueDate = new Date(todo.dueDate);
      return dueDate >= todayStart && dueDate < todayEnd;
    });
  }, [todos]);

  // Utility functions
  const getTodoById = useCallback(
    (todoId: string) => todos.find((todo) => todo.$id === todoId),
    [todos],
  );

  const refreshStats = useCallback(async () => {
    await fetchStats();
  }, [fetchStats]);

  return {
    // Data
    todos,
    stats,

    // State
    loading,
    error,
    creating,
    updating,
    deleting,

    // Actions
    refetch: fetchTodos,
    createTodoAction,
    toggleTodoAction,
    deleteTodoAction,
    updateTodoAction,
    addSubtaskAction,
    toggleSubtaskAction,
    addNoteAction,

    // Filtered data
    pendingTodos,
    completedTodos,
    overdueTodos,
    todayTodos,

    // Utility
    getTodoById,
    refreshStats,
  };
}
