// src/server/actions/insertCells.ts
"use server";

import { supabase } from "@/lib/supabaseClient";

interface Cell {
  id: string;
  row_id: string;
  column_id: string;
  value: string;
}

export async function insertCells(cells: Cell[]): Promise<boolean> {
  const { error } = await supabase
    .from("cells")
    .insert(cells);

  if (error) {
    console.error("Error inserting cells:", error);
    return false;
  }

  return true;
}
