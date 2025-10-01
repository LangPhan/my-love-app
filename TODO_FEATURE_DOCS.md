# Todo Feature Implementation

This implementation provides a complete todo management system for couples with real-time updates.

## Files Created/Updated:

### 1. `lib/todos.ts`
Core todo management functions including:
- `createTodo()` - Create new todos
- `toggleTodo()` - Toggle completion status
- `deleteTodo()` - Delete todos
- `updateTodo()` - Update todo properties
- `fetchTodosByCouple()` - Fetch todos with filtering/sorting
- `addSubtask()` - Add subtasks to todos
- `toggleSubtask()` - Toggle subtask completion
- `addTodoNote()` - Add notes to todos
- `getTodoStats()` - Get completion statistics

### 2. `hooks/useTodos.ts`
React hook with real-time Appwrite subscriptions:
- Real-time todo updates via Appwrite's realtime API
- Filtered views (pending, completed, overdue, today)
- Loading and error states
- Action functions with optimistic updates
- Statistics management

### 3. `components/todos/TodoList.tsx`
Complete todo UI component featuring:
- Add todo form with categories, priorities, due dates, tags
- Todo items with checkboxes, badges, inline editing
- Responsive mobile-first design
- Filter tabs (all, pending, completed, overdue)
- Statistics cards
- Delete and edit actions

### 4. `app/(main)/todos/page.tsx`
Server component that:
- Authenticates users
- Fetches couple information
- Renders the TodoList component
- Handles redirects for unauthenticated users

## Features:

✅ **Real-time Updates** - Changes sync instantly between partners
✅ **Rich Todo Properties** - Categories, priorities, due dates, tags, subtasks
✅ **Mobile Responsive** - Optimized for mobile and desktop
✅ **Server-side Rendering** - Initial data fetched on server
✅ **TypeScript** - Fully typed with comprehensive interfaces
✅ **Error Handling** - Graceful error states and loading indicators
✅ **Filtering & Sorting** - Multiple view options and sorting
✅ **Statistics** - Completion rates and progress tracking

## Usage:

Navigate to `/todos` to access the todo management interface. Users must be authenticated and part of a couple to use this feature.

The component automatically subscribes to real-time updates, so changes made by one partner are immediately visible to the other.

## Database Requirements:

Ensure the following Appwrite database collections exist:
- `todos` collection with appropriate attributes
- `users` collection with `coupleId` field
- `couples` collection

The todo collection should have attributes matching the `Todo` interface in `lib/types.ts`.