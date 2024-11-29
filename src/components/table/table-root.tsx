'use client';

import { Button } from "@/components/ui/button";
import DraggableTableHead from "@/components/table/draggable-table-head";
import { Plus } from "lucide-react";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCenter, UniqueIdentifier } from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { useState } from "react";
import DraggableTableRow from "./draggable-table-row";
import { usePathname } from "next/navigation";
import config from "@/data/getColor";
import { createPortal } from "react-dom";
import { restrictToHorizontalAxis, restrictToVerticalAxis } from "@dnd-kit/modifiers";

interface DataTableProps {
  initialColumns: Column[];
  initialRows: Row[];
  initialCells: Cell[];
}

export default function TableRoot({
  initialColumns,
  initialRows,
  initialCells,
}: DataTableProps) {
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [rows, setRows] = useState<Row[]>(initialRows);
  const [cells, setCells] = useState<Cell[]>(initialCells);

  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [activeRow, setActiveRow] = useState<Row | null>(null);

  const [lockedColumnIds, setLockedColumnIds] = useState<string[]>([]);
  const [lockedRowIds, setLockedRowIds] = useState<string[]>([]);

  const pathname = usePathname();
  const currentPath = pathname.split('/')[2];

  const { mainColor, subColor } = config[currentPath as keyof typeof config] || config.default;

  // const saveData = useCallback(async () => {
  //   await new Promise((resolve) => setTimeout(resolve, 500));
  // }, [columns, rows, cells]);

  // useEffect(() => {
  //   const debounce = setTimeout(() => {
  //     saveData();
  //   }, 2000);

  //   return () => clearTimeout(debounce);
  // }, [columns, rows, cells, saveData]);

  const handleCellUpdate = (cellId: string, newValue: string) => {
    setCells((prev) =>
      prev.map((cell) => (cell.id === cellId ? { ...cell, value: newValue } : cell))
    );
  }

  // 列の並び替え
  const handleReorderColumns = (activeId: UniqueIdentifier, overId: UniqueIdentifier) => {
    const oldIndex = columns.findIndex((col) => col.id === activeId.toString());
    const newIndex = columns.findIndex((col) => col.id === overId.toString());
    setColumns((prev) => arrayMove(prev, oldIndex, newIndex));
  };

  // 行の並び替え
  const handleReorderRows = (activeId: UniqueIdentifier, overId: UniqueIdentifier) => {
    const oldIndex = rows.findIndex((row) => row.id === activeId.toString());
    const newIndex = rows.findIndex((row) => row.id === overId.toString());
    setRows((prev) => arrayMove(prev, oldIndex, newIndex));
  };

  const handleToggleColumnLock = (columnId: string) => {
    setLockedColumnIds((prev) =>
      prev.includes(columnId)
        ? prev.filter((id) => id !== columnId)
        : [...prev, columnId]
    );
  };

  const handleToggleRowLock = (rowId: string) => {
    setLockedRowIds((prev) =>
      prev.includes(rowId)
        ? prev.filter((id) => id !== rowId)
        : [...prev, rowId]
    );
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { item, type } = event.active.data.current || {};
    if (type === 'Column') {
      const foundColumn = columns.find((col) => col.id === item.id);
      setActiveColumn(foundColumn || null);
    } else if (type === 'Row') {
      const foundRow = rows.find((row) => row.id === item.id);
      setActiveRow(foundRow || null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const { type } = active.data.current || {};
    if (type === 'Column') {
      handleReorderColumns(active.id, over.id);
      setActiveColumn(null);
    } else if (type === 'Row') {
      handleReorderRows(active.id, over.id);
      setActiveRow(null);
    }
  };

  return (
    // <DndContext
    //   collisionDetection={closestCenter}
    //   onDragStart={handleDragStart}
    //   onDragEnd={handleDragEnd}
    // >
    <>
      <div className="overflow-x-auto overflow-y-hidden rounded-md shadow-lg">
        <div className="bg-white -m-[2px]">
          <div className="flex">
            <div
              className="min-w-[92px] p-2 sticky left-0 z-10 shadow-locked-cell"
              style={{ backgroundColor: mainColor }}
            />
            <DndContext
              modifiers={[restrictToHorizontalAxis]}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={columns.map((col) => col.id as UniqueIdentifier)}>
                {columns.map((column) => (
                  <DraggableTableHead
                    key={column.id}
                    column={column}
                    mainColor={mainColor}
                    lockedColumnIds={lockedColumnIds}
                    handleToggleColumnLock={handleToggleColumnLock}
                  />
                ))}
              </SortableContext>
              {createPortal(
                <DragOverlay>
                  {activeColumn ? (
                    <DraggableTableHead
                      column={activeColumn}
                      mainColor={mainColor}
                      lockedColumnIds={lockedColumnIds}
                      handleToggleColumnLock={handleToggleColumnLock}
                    />
                  ) : null}
                </DragOverlay>,
                document.body
              )}
            </DndContext>
            {/* <div
              className="min-w-[52px] p-2 sticky right-0 z-10 border-white -ml-px border-l"
              style={{ backgroundColor: mainColor }}
            /> */}
          </div>
          <DndContext
            modifiers={[restrictToVerticalAxis]}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={rows.map((row) => row.id as UniqueIdentifier)}>
              {rows.map((row) => (
                <DraggableTableRow
                  key={row.id}
                  row={row}
                  columns={columns}
                  cells={cells.filter((cell) => cell.rowId === row.id)}
                  subColor={subColor}
                  lockedColumnIds={lockedColumnIds}
                  lockedRowIds={lockedRowIds}
                  handleToggleRowLock={handleToggleRowLock}
                  handleCellUpdate={handleCellUpdate}
                />
              ))}
            </SortableContext>
            {createPortal(
              <DragOverlay>
                {activeRow ? (
                  <DraggableTableRow
                    row={activeRow}
                    columns={columns}
                    cells={cells.filter((cell) => cell.rowId === activeRow.id)}
                    subColor={subColor}
                    lockedColumnIds={lockedColumnIds}
                    lockedRowIds={lockedRowIds}
                    handleToggleRowLock={handleToggleRowLock}
                    handleCellUpdate={handleCellUpdate}
                  />
                ) : null}
              </DragOverlay>,
              document.body
            )}
          </DndContext>
        </div>
      </div>
      <div className="p-4">
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Row
        </Button>
      </div>
    </>
  );
}
