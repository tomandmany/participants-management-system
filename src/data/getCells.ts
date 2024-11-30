// @/data/getCells.ts
import { supabase } from '@/lib/supabaseClient';

export async function getCells(): Promise<Cell[]> {
  const { data, error } = await supabase.from('cells').select('*');

  if (error) {
    console.error('Error fetching cells:', error);
    return [];
  }

  return data || [];
}
