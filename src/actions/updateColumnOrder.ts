// @/actions/updateColumnOrder.ts
'use server'
import { supabase } from "@/lib/supabaseClient";

interface ColumnOrder {
  id: string; // 列のID
  order: number; // 新しい順序
}

/**
 * 列の順序を更新する
 * @param columnOrders 更新された列の順序リスト
 * @returns 成功時: true, 失敗時: false
 */
export async function updateColumnOrder(columnOrders: ColumnOrder[]): Promise<boolean> {
  try {
    // バッチで列の順序を更新
    const updates = columnOrders.map((col) =>
      supabase
        .from("columns")
        .update({ order: col.order }) // 順序を更新
        .eq("id", col.id)
    );

    // すべてのクエリを並行実行
    const results = await Promise.all(updates);

    // エラーが1つでもあれば失敗
    const hasError = results.some((result) => result.error);
    if (hasError) {
      console.error("Failed to update one or more columns:", results);
      return false;
    }

    console.log("Column orders updated successfully");
    return true;
  } catch (error) {
    console.error("Error updating column orders:", error);
    return false;
  }
}
