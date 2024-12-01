import { supabase } from '@/lib/supabaseClient';

export default async function getCellsByTableId(
  columnIds: string[],
  rowIds: string[],
): Promise<Cell[]> {
  if (!columnIds.length || !rowIds.length) {
    console.error('Invalid columnIds or rowIds:', { columnIds, rowIds });
    return [];
  }

  // Supabase で cells を columnIds と rowIds に基づいて取得
  const { data, error } = await supabase
    .from('cells')
    .select('*')
    .in('column_id', columnIds)
    .in('row_id', rowIds);

  if (error) {
    console.error('Error fetching cells:', error);
    return [];
  }

  return data || [];
}
