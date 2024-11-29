import type { Database as DB } from '@/types/database.types';

declare global {
  type Database = DB;
  type Todo = DB['public']['Tables']['todos']['Row'];
  // type GroupData = {
  //   id: string;
  //   団体名: string;
  //   代表者: string;
  //   連絡先: string;
  //   活動内容: string;
  //   あいうえお: string;
  //   かきくけこ: string;
  //   さしすせそ: string;
  // };
  // 型定義
  type Column = {
    id: string; // 列の一意なID
    name: string; // 表示用の名前（例: "団体名", "代表者"）
    isLocked: boolean; // ロックされているかどうか
  };

  type Row = {
    id: string; // 行の一意なID
    isLocked: boolean; // ロックされているかどうか
  };

  type Cell = {
    id: string; // セルの一意なID
    rowId: string; // 紐づく行ID
    columnId: string; // 紐づく列ID
    value: string; // セルの内容
  };
}
