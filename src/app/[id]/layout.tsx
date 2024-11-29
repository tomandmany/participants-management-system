// app/layout.tsx

import TableRoot from "@/components/table/table-root";
import OpenNavigationModal from "@/components/navigation/open-navigation-modal";

// 初期データ
const columns: Column[] = [
  { id: 'column-0', name: "団体名", isLocked: false },
  { id: 'column-1', name: "代表者", isLocked: false },
  { id: 'column-2', name: "連絡先", isLocked: false },
  { id: 'column-3', name: "活動内容",  isLocked: false },
  { id: 'column-4', name: "あいうえお", isLocked: false },
  { id: 'column-5', name: "あいうえお", isLocked: false },
  { id: 'column-6', name: "あいうえお", isLocked: false },
  { id: 'column-7', name: "あいうえお", isLocked: false },
];

const rows: Row[] = [
  { id: 'row-0', isLocked: false },
  { id: 'row-1', isLocked: false },
  { id: 'row-2', isLocked: false },
  { id: 'row-3', isLocked: false },
];

const cells: Cell[] = [
  { id: 'cell-0', rowId: 'row-0', columnId: 'column-0', value: "サークルA" },
  { id: 'cell-1', rowId: 'row-0', columnId: 'column-1', value: "山田太郎" },
  { id: 'cell-2', rowId: 'row-0', columnId: 'column-2', value: "yamada@example.com" },
  { id: 'cell-3', rowId: 'row-0', columnId: 'column-3', value: "音楽" },
  { id: 'cell-4', rowId: 'row-0', columnId: 'column-4', value: "aiueo" },
  { id: 'cell-5', rowId: 'row-1', columnId: 'column-0', value: "サークルB" },
  { id: 'cell-6', rowId: 'row-1', columnId: 'column-1', value: "佐藤花子" },
  { id: 'cell-7', rowId: 'row-1', columnId: 'column-2', value: "sato@example.com" },
  { id: 'cell-8', rowId: 'row-1', columnId: 'column-3', value: "ダンス" },
  { id: 'cell-9', rowId: 'row-1', columnId: 'column-4', value: "aiueo" },
];

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div className="container mx-auto py-10 px-4">
        <OpenNavigationModal />
        <TableRoot initialColumns={columns} initialRows={rows} initialCells={cells} />
      </div>
      {children}
    </>
  );
}
