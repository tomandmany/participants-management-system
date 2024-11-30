// src/server/actions/updateCell.ts
"use server";

import { supabase } from "@/lib/supabaseClient";

export async function updateCell(cellId: string, newValue: string): Promise<boolean> {
  const { error } = await supabase
    .from("cells")
    .update({ value: newValue })
    .eq("id", cellId);

  if (error) {
    console.error("Error updating cell:", error);
    return false;
  }

  return true;
}