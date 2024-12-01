// @/actions/updateRowOrder.ts
'use server'
import { supabase } from "@/lib/supabaseClient";

interface RowOrder {
  id: string; // 行のID
  order: number; // 新しい順序
}

/**
 * 行の順序を更新する
 * @param rowOrders 更新された行の順序リスト
 * @returns 成功時: true, 失敗時: false
 */
export async function updateRowOrder(rowOrders: RowOrder[]): Promise<boolean> {
  try {
    // バッチで行の順序を更新
    const updates = rowOrders.map((row) =>
      supabase
        .from("rows")
        .update({ order: row.order }) // 順序を更新
        .eq("id", row.id)
    );

    // すべてのクエリを並行実行
    const results = await Promise.all(updates);

    // エラーが1つでもあれば失敗
    const hasError = results.some((result) => result.error);
    if (hasError) {
      console.error("Failed to update one or more rows:", results);
      return false;
    }

    console.log("row orders updated successfully");
    return true;
  } catch (error) {
    console.error("Error updating row orders:", error);
    return false;
  }
}
