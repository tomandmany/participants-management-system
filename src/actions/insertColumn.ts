"use server";

import { supabase } from "@/lib/supabaseClient";

export async function insertColumn(rows: Row[]): Promise<string | null> {
  // 新しい列を追加
  const { data: column, error: columnError } = await supabase
    .from("columns")
    .insert({ name: `New Column`, is_locked: false }) // 必要に応じて名前やロック状態を変更
    .select("id")
    .single();

  if (columnError || !column?.id) {
    console.error("Error inserting column:", columnError);
    return null;
  }

  const newColumnId = column.id;

  // 受け取った行に基づいて対応する空のセルを作成
  const cells = rows.map((row) => ({
    id: crypto.randomUUID(), // 一意なIDを生成
    row_id: row.id,
    column_id: newColumnId,
    value: "", // 空の値
  }));

  // セルを挿入
  const { error: cellError } = await supabase.from("cells").insert(cells);

  if (cellError) {
    console.error("Error inserting cells for new column:", cellError);
    return null; // エラー時には新しい列もロールバックしたい場合があります
  }

  return newColumnId;
}
