// @/data/get-cells.ts
import { supabase } from '@/lib/supabaseClient';

export default async function getCells(): Promise<Cell[]> {
  const { data, error } = await supabase.from('cells').select('*');

  if (error) {
    console.error('Error fetching cells:', error);
    return [];
  }

  return data || [];
}
