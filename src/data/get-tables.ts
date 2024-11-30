// @/data/get-tables.ts
import { supabase } from '@/lib/supabaseClient';

export default async function getTables(): Promise<Table[]> {
  const { data, error } = await supabase.from('tables').select('*');

  if (error) {
    console.error('Error fetching tables:', error);
    return [];
  }

  return data || [];
}
