export interface Income {
  id: number;          // Unique identifier (UUID or incremental)
  title: string;        // String category title
  date: string;        // ISO date string "2025-09-13"
  time: string;        // "14:35" or in HH:mm format
  total: number;       // Amount spent
  comment?: string;    // Optional notes
}
