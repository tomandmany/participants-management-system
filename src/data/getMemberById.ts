// @/data/getMemberById.ts
import { supabase } from '@/lib/supabaseClient';

export async function getMemberById(id: string): Promise<Todo[]> {
  const { data, error } = await supabase.from('members').select('*').eq('id', id);

  if (error) {
    console.error('Error fetching members:', error);
    return [];
  }

  return data || [];
}