export interface Project {
  id: number | string;
  name: string;
  description: string;
  ownerId: number | string;
  status: 'active' | 'archived';
  startDate: string;
  dueDate: string;
}