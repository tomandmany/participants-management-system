// @/data/getRows.ts
import { supabase } from '@/lib/supabaseClient';

export async function getRows(): Promise<Row[]> {
  const { data, error } = await supabase.from('rows').select('*');

  if (error) {
    console.error('Error fetching rows:', error);
    return [];
  }

  return data || [];
}
