// @/data/get-rows-by-table-id.ts
import { supabase } from '@/lib/supabaseClient';
import getTables from '@/data/get-tables';

export default async function getRowsByTableId(
  table_id: string
): Promise<Row[]> {
  if (!table_id) {
    console.error('Invalid table_id:', table_id);
    return [];
  }

  // テーブルidとパスを照らし合わせてテーブル情報を取得
  const tables = await getTables();
  const table = tables.find((t) => t.id === table_id);

  if (!table) {
    console.error('Table not found for table:', table);
    return [];
  }

  const { data, error } = await supabase
    .from('rows')
    .select('*')
    .eq('table_id', table.id);

  if (error) {
    console.error('Error fetching rows:', error);
    return [];
  }

  return data || [];
}
