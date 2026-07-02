---
name: zustand
description: Guidelines for state management in React using Zustand, emphasizing performant selectors, correct state updates, and avoiding side-effects (like spreading items or state in selectors).
---

# Zustand State Management Guidelines

Use this skill when defining, updating, or consuming Zustand stores in the React frontend.

---

## 1. Store Definition

Define stores using `create` from `zustand` and export hooks with proper TypeScript type safety. Keep state and actions co-located in the store definition.

```typescript
import { create } from "zustand";

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

interface TodoState {
  todos: Todo[];
  // Actions
  addTodo: (text: string) => void;
  toggleTodo: (id: string) => void;
  removeTodo: (id: string) => void;
  reset: () => void;
}

export const useTodoStore = create<TodoState>((set) => ({
  todos: [],
  
  // Zustand's set() automatically performs a shallow merge at the root level.
  // Do NOT spread the rest of the store state (e.g. ...state) unless updating nested objects.
  addTodo: (text) =>
    set((state) => ({
      todos: [...state.todos, { id: crypto.randomUUID(), text, completed: false }],
    })),

  toggleTodo: (id) =>
    set((state) => ({
      todos: state.todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      ),
    })),

  removeTodo: (id) =>
    set((state) => ({
      todos: state.todos.filter((todo) => todo.id !== id),
    })),

  reset: () => set({ todos: [] }),
}));
```

---

## 2. Performant Selector Pattern (No Side-Effects)

To prevent performance issues and infinite re-render loops, strictly follow these selector guidelines.

### A. Avoid Destructuring Without Selectors (The Whole-State Spread Anti-pattern)

Do **NOT** destructure the store hook directly or grab the entire state. This subscribes the component to all state changes, causing it to re-render when any property (even unrelated ones) updates.

```typescript
// ❌ BAD: Re-renders the component when ANY part of the store updates
const { todos, addTodo } = useTodoStore();

// ❌ BAD: Destructuring from a generic hook reference
const state = useTodoStore();
const todos = state.todos;
```

Instead, select individual state properties or actions:

```typescript
// ✓ GOOD: Re-renders ONLY when 'todos' changes
const todos = useTodoStore((state) => state.todos);
const addTodo = useTodoStore((state) => state.addTodo);
```
### B. Do NOT Spread Items or Recreate References in Selectors

Never return a newly created array or object reference directly from a selector. Doing so creates a new reference on every single render, leading to infinite re-render loops or unnecessary re-renders.

```typescript
// ❌ BAD: Returns a new array reference every render, causing infinite loops/re-renders
const activeTodos = useTodoStore((state) => state.todos.filter(t => !t.completed));

// ❌ BAD: Spreading state/items in the selector creates a new reference on every render
const todosCopy = useTodoStore((state) => [...state.todos]);
```

**Correct Approach:**

Select the raw, stable state and perform filtering, mapping, or spreading in the component, wrapping the operation in `useMemo` to keep references stable:

```typescript
// ✓ GOOD: Selects stable reference, filters in component with memoization
const todos = useTodoStore((state) => state.todos);
const activeTodos = useMemo(() => todos.filter((t) => !t.completed), [todos]);
```

---

## 3. Immutability & State Updates

### A. Root State Merging
Zustand's `set` automatically merges state at the root level.
- **Do not do**: `set((state) => ({ ...state, todos }))`
- **Do**: `set({ todos })` or `set((state) => ({ todos }))`

### B. Avoid Side-Effects / Direct Mutation
Do not mutate states directly prior to returning them. Always return new array or object references.

```typescript
// ❌ BAD: Mutating the existing array in-place (does not trigger state change detection)
set((state) => {
  state.todos.push(newTodo);
  return { todos: state.todos };
});

// ✓ GOOD: Return a new array reference
set((state) => ({
  todos: [...state.todos, newTodo]
}));
```
