export interface Task {
  id: number;
  projectId: number;
  title: string;
  description: string;
  assigneeId: number;
  statusId: number;
  priorityId: number;
  dueDate: string;
  estimateHours: number;
  labelIds: number[];
}