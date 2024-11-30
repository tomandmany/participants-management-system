// src/server/actions/insertRow.ts
"use server";

import { supabase } from "@/lib/supabaseClient";

interface Column {
  id: string;
  name: string;
  is_locked: boolean;
}

export async function insertRow(columns: Column[]): Promise<string | null> {
  // 新しい行を追加
  const { data: row, error: rowError } = await supabase
    .from("rows")
    .insert({ is_locked: false })
    .select("id")
    .single();

  if (rowError || !row?.id) {
    console.error("Error inserting row:", rowError);
    return null;
  }

  const newRowId = row.id;

  // 対応する空のセルを追加
  const cells = columns.map((column) => ({
    id: crypto.randomUUID(), // 一意なIDを生成
    row_id: newRowId,
    column_id: column.id,
    value: "", // 空の値
  }));

  const { error: cellError } = await supabase.from("cells").insert(cells);

  if (cellError) {
    console.error("Error inserting cells for new row:", cellError);
    return null; // エラー時には新しい行もロールバックしたい場合があります
  }

  return newRowId;
}
