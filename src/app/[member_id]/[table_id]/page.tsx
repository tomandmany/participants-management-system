import TableRoot from "@/components/table/table-root";
import NavigationOpenModal from "@/components/navigation/navigation-open-modal";
import getTables from "@/data/get-tables";
import getColumnsByTableId from "@/data/get-columns-by-table-id";
import getRowsByTableId from "@/data/get-rows-by-table-id";
import getCellsByTableId from "@/data/get-cells-by-table-id";
import Link from "next/link";
import { Undo2 } from "lucide-react";

interface PageProps {
  params: Promise<{
    member_id: string;
    table_id: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { member_id, table_id } = await params;

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

  const columnIds = columns.map((col) => col.id);
  const rowIds = rows.map((row) => row.id);

  const cells = await getCellsByTableId(columnIds, rowIds);

  return (
    <>
      <Link href={'/'} className="fixed top-4 left-4 hover:shadow-button-dark rounded-full p-4 transition">
        <Undo2 />
      </Link>
      <div className="mx-auto w-fit">
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
    </>
  );
}
