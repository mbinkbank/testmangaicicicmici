import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://btbgkxhicdbdzqwcdlgd.supabase.co";
const supabaseAnonKey = "sb_publishable_VMGnQuP0jWqA61s6DgPFgA__GXkkpIm";

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
