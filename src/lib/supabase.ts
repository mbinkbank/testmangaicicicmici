import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://btbgkxhicdbdzqwcdlgd.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0YmdreGhpY2RiZHpxd2NkbGdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU5MjE0MDAsImV4cCI6MjA1MTQ5NzQwMH0.Ej8vKqL5nX8mP3qR7sT9uV1wY2zA4bC6dE8fG0hI2jK4";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type MangaRow = {
  id: string;
  title: string;
  author: string;
  genre: string;
  season: string | null;
  description: string;
  chapter: number;
  cover_url: string;
  rating: string;
  created_at: string;
};