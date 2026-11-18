export interface TimeEntry {
  id: number | string;
  taskId: number | string;
  userId: number | string;
  minutes: number;
  date: string;
  note: string;
}
