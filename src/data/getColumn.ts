// @/data/getColumns.ts
import { supabase } from '@/lib/supabaseClient';

export async function getColumns(): Promise<Column[]> {
  const { data, error } = await supabase.from('columns').select('*');

  if (error) {
    console.error('Error fetching columns:', error);
    return [];
  }

  return data || [];
}
