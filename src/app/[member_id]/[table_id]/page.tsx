import TableRoot from "@/components/table/table-root";
import NavigationOpenModal from "@/components/navigation/navigation-open-modal";
import getTables from "@/data/get-tables";
import getCells from "@/data/get-cells";
import getColumnsByTableId from "@/data/get-columns-by-table-id";
import getRowsByTableId from "@/data/get-rows-by-table-id";

interface PageProps {
  params: Promise<{
    member_id: string;
    table_id: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  // 非同期的に params を取得
  const { member_id, table_id } = await params;

  console.log("Member ID:", member_id);
  console.log("Table ID:", table_id);

  const tables = await getTables();
  if (!tables) {
    throw new Error("Tables not found");
  }

  const currentTable = tables.find((table) => table.id === table_id);
  if (!currentTable) {
    throw new Error("CurrentTable not found");
  }

  const columns = await getColumnsByTableId(table_id);
  const rows = await getRowsByTableId(table_id);
  const cells = await getCells();

  return (
    <div className="mx-auto py-10 w-fit">
      <NavigationOpenModal
        member_id={member_id}
        tables={tables}
        currentTable={currentTable}
      />
      <TableRoot
        currentTable={currentTable}
        initialColumns={columns}
        initialRows={rows}
        initialCells={cells}
      />
    </div>
  );
}
