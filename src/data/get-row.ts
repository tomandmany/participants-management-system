// @/data/get-rows.ts
import { supabase } from '@/lib/supabaseClient';

export default async function getRows(): Promise<Row[]> {
  const { data, error } = await supabase.from('rows').select('*');

  if (error) {
    console.error('Error fetching rows:', error);
    return [];
  }

  return data || [];
}
