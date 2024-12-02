// src/server/actions/updateColumnName.ts
"use server";

import { supabase } from "@/lib/supabaseClient";

export async function updateColumnName(columnId: string, newName: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("columns")
    .update({ name: newName })
    .eq("id", columnId);

  if (error) {
    console.error("Error updating column:", error);  // エラー詳細をログに出力
    return false;
  }

  console.log("Successfully updated column:", data);  // 更新成功時のデータをログに出力
  return true;
}
