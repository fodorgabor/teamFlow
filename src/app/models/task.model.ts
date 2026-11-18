export interface Task {
  id: number | string;
  projectId: number | string;
  title: string;
  description: string;
  assigneeId: number | string;
  statusId: number | string;
  priorityId: number | string;
  dueDate: string;
  estimateHours: number;
  labelIds: (number | string)[];
}