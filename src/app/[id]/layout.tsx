// app/layout.tsx

import TableRoot from "@/components/table/table-root";
import NavigationOpenModal from "@/components/navigation/navigation-open-modal";
import { getColumns } from "@/data/getColumn";
import { getRows } from "@/data/getRow";
import { getCells } from "@/data/getCells";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const columns = await getColumns();
  const rows = await getRows();
  const cells = await getCells();

  return (
    <>
      <div className="mx-auto py-10 w-fit">
      {/* <div className="hidden lg:block mx-auto py-10 w-fit"> */}
        <NavigationOpenModal />
        <TableRoot initialColumns={columns} initialRows={rows} initialCells={cells} />
      </div>
      {children}
    </>
  );
}
