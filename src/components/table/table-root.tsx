'use client';

import { Button } from "@/components/ui/button";
import TableDraggableHead from "@/components/table/table-draggable-head";
import TableDraggableRow from "./table-draggable-row";
import { Plus } from "lucide-react";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCenter, UniqueIdentifier } from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import config from "@/data/getColor";
import { createPortal } from "react-dom";
import { restrictToHorizontalAxis, restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { updateCell } from "@/actions/updateCell";
import { insertRow } from "@/actions/insertRow";
import { insertColumn } from "@/actions/insertColumn";

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

  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // クライアントサイドでのみ document.body を参照
    setPortalContainer(document.body);
  }, []);

  const tableRef = useRef<HTMLDivElement>(null);
  const [tableRect, setTableRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const updateTableRect = () => {
      if (tableRef.current) {
        setTableRect(tableRef.current.getBoundingClientRect());
      }
    };

    updateTableRect();
    window.addEventListener("resize", updateTableRect);
    return () => window.removeEventListener("resize", updateTableRect);
  }, [columns, rows]);

  const handleCellUpdate = async (cellId: string, newValue: string) => {
    // サーバーアクションを呼び出して Supabase を更新
    const success = await updateCell(cellId, newValue);

    if (!success) {
      console.error(`Failed to update cell with ID: ${cellId}`);
      // 必要に応じて状態を元に戻す
    }
  };

  async function handleAddColumn() {
    const sanitizedRows = rows.map((row) => ({
      ...row,
      is_locked: row.is_locked ?? false, // null を false に変換
    }));

    const newColumnId = await insertColumn(sanitizedRows);

    if (newColumnId) {
      console.log("New column inserted with ID:", newColumnId);

      // クライアント側の状態に新しい列と対応するセルを追加
      const newColumn = { id: newColumnId, name: `New Column`, is_locked: false };
      setColumns((prev) => [...prev, newColumn]);

      const newCells = rows.map((row) => ({
        id: crypto.randomUUID(),
        row_id: row.id,
        column_id: newColumnId,
        value: "",
      }));
      setCells((prev) => [...prev, ...newCells]);
    } else {
      console.error("Failed to insert new column");
    }
  }

  async function handleAddRow() {
    // columns を変換して渡す
    const sanitizedColumns = columns.map((col) => ({
      ...col,
      is_locked: col.is_locked ?? false, // null を false に変換
    }));

    const newRowId = await insertRow(sanitizedColumns);

    if (newRowId) {
      console.log("New row inserted with ID:", newRowId);

      // ローカル状態に新しい行を追加
      const newRow = { id: newRowId, is_locked: false };
      setRows((prev) => [...prev, newRow]);

      // ローカル状態に新しいセルを追加
      const newCells = columns.map((column) => ({
        id: crypto.randomUUID(),
        row_id: newRowId,
        column_id: column.id,
        value: "",
      }));
      setCells((prev) => [...prev, ...newCells]);
    } else {
      console.error("Failed to insert new row");
    }
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
    setColumns((prevColumns) => {
      const columnToToggle = prevColumns.find((col) => col.id === columnId);
      if (!columnToToggle) return prevColumns;

      const isLocked = lockedColumnIds.includes(columnId);
      let newColumns;

      if (isLocked) {
        // ロック解除：元の位置に戻す
        newColumns = prevColumns.filter((col) => col.id !== columnId);
        newColumns.splice(initialColumns.findIndex((col) => col.id === columnId), 0, columnToToggle);
      } else {
        // ロック：ロックされた列の最後に移動
        const lockedColumns = prevColumns.filter((col) => lockedColumnIds.includes(col.id));
        const unlockedColumns = prevColumns.filter((col) => !lockedColumnIds.includes(col.id) && col.id !== columnId);
        newColumns = [...lockedColumns, columnToToggle, ...unlockedColumns];
      }

      return newColumns;
    });

    setLockedColumnIds((prevLockedIds) =>
      prevLockedIds.includes(columnId)
        ? prevLockedIds.filter((id) => id !== columnId)
        : [...prevLockedIds, columnId]
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
    <>
      <div className="overflow-x-auto overflow-y-hidden rounded-md shadow-lg max-w-6xl" ref={tableRef}>
        <div className="bg-white">
          <div className="flex">
            <div
              className="min-w-[92px] p-2 sticky left-0 z-10 shadow-locked-cell"
              style={{ backgroundColor: mainColor }}
            />
            <DndContext
              id='columns'
              modifiers={[restrictToHorizontalAxis]}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={columns.map((col) => col.id as UniqueIdentifier)}>
                {columns.map((column) => (
                  <TableDraggableHead
                    key={column.id}
                    column={column}
                    mainColor={mainColor}
                    lockedColumnIds={lockedColumnIds}
                    handleToggleColumnLock={handleToggleColumnLock}
                  />
                ))}
              </SortableContext>
              {portalContainer &&
                createPortal(
                  <DragOverlay>
                    {activeColumn ? (
                      <TableDraggableHead
                        column={activeColumn}
                        mainColor={mainColor}
                        lockedColumnIds={lockedColumnIds}
                        handleToggleColumnLock={handleToggleColumnLock}
                      />
                    ) : null}
                  </DragOverlay>,
                  portalContainer
                )
              }
            </DndContext>
            {/* <div
                className="min-w-[52px] p-2 sticky right-0 z-10 border-white -ml-px border-l"
                style={{ backgroundColor: mainColor }}
              /> */}
          </div>
          <DndContext
            id='rows'
            modifiers={[restrictToVerticalAxis]}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={rows.map((row) => row.id as UniqueIdentifier)}>
              {rows.map((row) => (
                <TableDraggableRow
                  key={row.id}
                  row={row}
                  columns={columns}
                  setCells={setCells}
                  cells={cells.filter((cell) => cell.row_id === row.id)}
                  subColor={subColor}
                  lockedColumnIds={lockedColumnIds}
                  lockedRowIds={lockedRowIds}
                  handleToggleRowLock={handleToggleRowLock}
                  handleCellUpdate={handleCellUpdate}
                />
              ))}
            </SortableContext>
            {portalContainer &&
              createPortal(
                <DragOverlay>
                  {activeRow ? (
                    <TableDraggableRow
                      row={activeRow}
                      columns={columns}
                      cells={cells.filter((cell) => cell.row_id === activeRow.id)}
                      setCells={setCells}
                      subColor={subColor}
                      lockedColumnIds={lockedColumnIds}
                      lockedRowIds={lockedRowIds}
                      handleToggleRowLock={handleToggleRowLock}
                      handleCellUpdate={handleCellUpdate}
                    />
                  ) : null}
                </DragOverlay>,
                portalContainer
              )
            }
          </DndContext>
        </div>
      </div>
      {/* 行追加ボタン */}
      {tableRect && (
        <Button
          className="p-3 w-fit h-fit shadow-md hover:shadow-lg z-10 hover:translate-y-1 hover:scale-[1.15] transition fixed"
          style={{
            backgroundColor: mainColor,
            left: `${tableRect.left + tableRect.width / 2}px`,
            top: `${tableRect.bottom + 16}px`,
            transform: "translateX(-50%)",
          }}
          onClick={handleAddRow}
        >
          <Plus className="min-w-6 min-h-6" />
        </Button>
      )}

      {/* カラム追加ボタン */}
      {tableRect && (
        <Button
          className="p-3 w-fit h-fit shadow-md hover:shadow-lg z-10 hover:translate-y-1 hover:scale-[1.15] transition fixed"
          style={{
            backgroundColor: mainColor,
            left: `${tableRect.right + 16}px`,
            top: `${tableRect.top + tableRect.height / 2}px`,
            transform: "translateY(-50%)",
          }}
          onClick={handleAddColumn}
        >
          <Plus className="min-w-6 min-h-6" />
        </Button>
      )}
    </>
  );
}
