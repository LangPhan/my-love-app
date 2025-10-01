/**
 * TodoList Component
 *
 * A comprehensive todo list component with add form, items with checkboxes,
 * deadline chips, and responsive mobile layout with real-time updates.
 */

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useTodos } from "@/hooks/useTodos";
import type { CreateTodoData, Todo } from "@/lib/types";
import { Calendar, Edit3, Plus, Trash2, User } from "lucide-react";
import React, { useState } from "react";

interface TodoListProps {
  coupleId: string;
  className?: string;
}

interface AddTodoFormProps {
  onSubmit: (todoData: CreateTodoData) => Promise<boolean>;
  creating: boolean;
  onClose: () => void;
}

const priorityColors = {
  low: "bg-green-100 text-green-800 border-green-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  high: "bg-red-100 text-red-800 border-red-200",
};

const categoryColors = {
  "date-ideas": "bg-pink-100 text-pink-800 border-pink-200",
  home: "bg-blue-100 text-blue-800 border-blue-200",
  travel: "bg-purple-100 text-purple-800 border-purple-200",
  goals: "bg-indigo-100 text-indigo-800 border-indigo-200",
  shopping: "bg-orange-100 text-orange-800 border-orange-200",
  events: "bg-emerald-100 text-emerald-800 border-emerald-200",
  other: "bg-gray-100 text-gray-800 border-gray-200",
};

const statusColors = {
  pending: "bg-slate-100 text-slate-800 border-slate-200",
  "in-progress": "bg-blue-100 text-blue-800 border-blue-200",
  completed: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

function AddTodoForm({ onSubmit, creating, onClose }: AddTodoFormProps) {
  const [formData, setFormData] = useState<CreateTodoData>({
    title: "",
    description: "",
    category: "other", // Keep for compatibility but won't be used
    priority: "low",
    dueDate: "",
    tags: [], // Keep for compatibility but won't be used
  });
  const [tagInput, setTagInput] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const success = await onSubmit(formData);
    if (success) {
      setFormData({
        title: "",
        description: "",
        category: "other",
        priority: "low",
        dueDate: "",
        tags: [],
      });
      setTagInput("");
      onClose();
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags?.filter((t) => t !== tag) || [],
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4">
        <div>
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, title: e.target.value }))
            }
            placeholder="What needs to be done?"
            required
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            placeholder="Add more details..."
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="priority">Priority</Label>
          <Select
            value={formData.priority}
            onValueChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                priority: value as Todo["priority"],
              }))
            }
          >
            <SelectTrigger className="w-full rounded-xl">
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="dueDate">Due Date</Label>
          <Input
            id="dueDate"
            type="datetime-local"
            value={formData.dueDate}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, dueDate: e.target.value }))
            }
          />
        </div>

        {/* Note: Tags functionality removed as it's not supported by current database schema */}
      </div>

      <div className="flex gap-2 pt-4">
        <Button
          type="submit"
          disabled={creating || !formData.title.trim()}
          className="flex-1"
        >
          {creating ? "Creating..." : "Create Todo"}
        </Button>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function TodoItem({
  todo,
  onToggle,
  onDelete,
  onUpdate,
  currentUserId,
}: {
  todo: Todo;
  onToggle: (todoId: string, userId: string) => Promise<boolean>;
  onDelete: (todoId: string) => Promise<boolean>;
  onUpdate: (todoId: string, updates: Partial<Todo>) => Promise<boolean>;
  currentUserId: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return "Overdue";
    } else if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Tomorrow";
    } else if (diffDays <= 7) {
      return `${diffDays} days`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const isOverdue =
    todo.dueDate &&
    new Date(todo.dueDate) < new Date() &&
    !(todo as any).isCompleted;

  const handleSaveEdit = async () => {
    if (editTitle.trim() && editTitle !== todo.title) {
      await onUpdate(todo.$id, { title: editTitle.trim() });
    }
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveEdit();
    } else if (e.key === "Escape") {
      setEditTitle(todo.title);
      setIsEditing(false);
    }
  };

  return (
    <Card
      className={`transition-all hover:shadow-md ${(todo as any).isCompleted ? "opacity-75" : ""}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <button
            onClick={() => onToggle(todo.$id, currentUserId)}
            className={`mt-1 flex h-5 w-5 items-center justify-center rounded border-2 transition-colors ${
              (todo as any).isCompleted
                ? "border-green-500 bg-green-500 text-white"
                : "border-gray-300 hover:border-green-400"
            }`}
          >
            {(todo as any).isCompleted && "✓"}
          </button>

          <div className="min-w-0 flex-1">
            {/* Title */}
            <div className="mb-2 flex items-center justify-between">
              {isEditing ? (
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onBlur={handleSaveEdit}
                  onKeyDown={handleKeyPress}
                  className="text-base font-medium"
                  autoFocus
                />
              ) : (
                <h3
                  className={`text-base font-medium ${
                    (todo as any).isCompleted
                      ? "text-gray-500 line-through"
                      : ""
                  }`}
                  onClick={() => setIsEditing(true)}
                >
                  {todo.title}
                </h3>
              )}

              {/* Actions */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="h-8 w-8 p-0"
                >
                  <Edit3 className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(todo.$id)}
                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Description */}
            {todo.description && (
              <p className="mb-3 text-sm text-gray-600">{todo.description}</p>
            )}

            {/* Badges */}
            <div className="mb-3 flex flex-wrap gap-2">
              {/* Priority */}
              <Badge className={priorityColors[todo.priority]}>
                {todo.priority}
              </Badge>

              {/* Status */}
              <Badge
                className={
                  (todo as any).isCompleted
                    ? "border-green-200 bg-green-100 text-green-800"
                    : "border-slate-200 bg-slate-100 text-slate-800"
                }
              >
                {(todo as any).isCompleted ? "completed" : "pending"}
              </Badge>

              {/* Due Date */}
              {todo.dueDate && (
                <Badge
                  className={`flex items-center gap-1 ${
                    isOverdue
                      ? "border-red-200 bg-red-100 text-red-800"
                      : "border-blue-200 bg-blue-100 text-blue-800"
                  }`}
                >
                  <Calendar className="h-3 w-3" />
                  {formatDate(todo.dueDate)}
                </Badge>
              )}
            </div>

            {/* Note: Tags not available in current database schema */}

            {/* Assigned To */}
            {todo.assignedTo && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="h-3 w-3" />
                <span>Assigned to user</span>
              </div>
            )}

            {/* Completion Info */}
            {(todo as any).isCompleted && (
              <div className="mt-2 text-xs text-gray-500">Completed</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function TodoList({ coupleId, className = "" }: TodoListProps) {
  const { user } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [filter, setFilter] = useState<
    "all" | "pending" | "completed" | "overdue"
  >("all");

  const {
    todos,
    stats,
    loading,
    error,
    creating,
    createTodoAction,
    toggleTodoAction,
    deleteTodoAction,
    updateTodoAction,
    pendingTodos,
    completedTodos,
    overdueTodos,
  } = useTodos({ coupleId });

  const filteredTodos = {
    all: todos,
    pending: pendingTodos,
    completed: completedTodos,
    overdue: overdueTodos,
  }[filter];

  const handleCreateTodo = async (
    todoData: CreateTodoData,
  ): Promise<boolean> => {
    if (!user) return false;
    return await createTodoAction({ ...todoData, createdBy: user.$id });
  };

  if (loading && todos.length === 0) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-24" />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Skeleton className="h-5 w-5 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Our Todos</h2>
          {stats && (
            <p className="mt-1 text-sm text-gray-600">
              {stats.completed} of {stats.total} completed (
              {stats.completionRate}%)
            </p>
          )}
        </div>

        <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Todo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Todo</DialogTitle>
            </DialogHeader>
            <AddTodoForm
              onSubmit={handleCreateTodo}
              creating={creating}
              onClose={() => setShowAddForm(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {stats.pending}
              </div>
              <div className="text-sm text-gray-600">Pending</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {stats.completed}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">
                {stats.overdue}
              </div>
              <div className="text-sm text-gray-600">Overdue</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {stats.completionRate}%
              </div>
              <div className="text-sm text-gray-600">Complete</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {(["all", "pending", "completed", "overdue"] as const).map(
          (filterOption) => (
            <Button
              key={filterOption}
              variant={filter === filterOption ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(filterOption)}
              className="whitespace-nowrap"
            >
              {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
              {filterOption === "all" &&
                todos.length > 0 &&
                ` (${todos.length})`}
              {filterOption === "pending" &&
                pendingTodos.length > 0 &&
                ` (${pendingTodos.length})`}
              {filterOption === "completed" &&
                completedTodos.length > 0 &&
                ` (${completedTodos.length})`}
              {filterOption === "overdue" &&
                overdueTodos.length > 0 &&
                ` (${overdueTodos.length})`}
            </Button>
          ),
        )}
      </div>

      {/* Error */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-800">Error: {error}</p>
          </CardContent>
        </Card>
      )}

      {/* Todo List */}
      <div className="space-y-3">
        {filteredTodos.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-gray-500">
                {filter === "all" ? "No todos yet" : `No ${filter} todos`}
              </div>
              {filter === "all" && (
                <Button
                  variant="outline"
                  onClick={() => setShowAddForm(true)}
                  className="mt-4 gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Create your first todo
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredTodos.map((todo) => (
            <TodoItem
              key={todo.$id}
              todo={todo}
              onToggle={toggleTodoAction}
              onDelete={deleteTodoAction}
              onUpdate={updateTodoAction}
              currentUserId={user?.$id || ""}
            />
          ))
        )}
      </div>
    </div>
  );
}
