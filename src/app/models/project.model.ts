export interface Project {
  id: number;
  name: string;
  description: string;
  ownerId: number;
  status: 'active' | 'archived';
  startDate: string;
  dueDate: string;
}