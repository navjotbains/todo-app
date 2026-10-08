export interface Todo {
  id: string;
  title: string;
  isCompleted: boolean;
  createdAt: string;
}

export type TodoFilter = 'all' | 'active' | 'done';