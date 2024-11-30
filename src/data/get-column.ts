// @/data/get-columns.ts
import { supabase } from '@/lib/supabaseClient';

export default async function getColumns(): Promise<Column[]> {
  const { data, error } = await supabase.from('columns').select('*');

  if (error) {
    console.error('Error fetching columns:', error);
    return [];
  }

  return data || [];
}
