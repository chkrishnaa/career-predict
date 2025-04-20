// Common shared types

export type ID = string | number;

export interface DateRange {
  start: string;
  end: string;
}

export interface PageInfo {
  title: string;
  description?: string;
  keywords?: string[];
}

export type Status = 'idle' | 'loading' | 'succeeded' | 'failed';

export interface BaseState {
  status: Status;
  error: string | null;
} 