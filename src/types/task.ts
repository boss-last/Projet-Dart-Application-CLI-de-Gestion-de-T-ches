export type PriorityLevel = 'low' | 'medium' | 'high';
export type TaskType = 'standard' | 'urgent';

export interface TaskItem {
  id: string;
  title: string;
  priority: PriorityLevel;
  dueDate: string | null;
  isCompleted: boolean;
  createdAt: string;
  taskType: TaskType;
  escalationReason?: string;
}

export interface UnitTestResult {
  id: string;
  group: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  durationMs?: number;
  assertionCount: number;
}
