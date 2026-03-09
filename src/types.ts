export type TaskStatus = 'todo' | 'in-progress' | 'done';
export type TaskPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AddTaskInput {
  title: string;
  description?: string;
  priority?: TaskPriority;
  tags?: string[];
}

export interface ListTaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  tag?: string;
}
