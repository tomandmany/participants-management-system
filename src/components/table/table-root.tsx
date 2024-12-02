'use client';

import { Button } from "@/components/ui/button";
import TableDraggableHead from "@/components/table/table-draggable-head";
import TableDraggableRow from "./table-draggable-row";
import { MessageCirclePlus, Plus } from "lucide-react";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCenter, UniqueIdentifier, DragMoveEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { restrictToHorizontalAxis, restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { updateCell } from "@/actions/updateCell";
import { insertRow } from "@/actions/insertRow";
import { insertColumn } from "@/actions/insertColumn";
import { Input } from "@/components/ui/input";
import { updateColumnOrder } from "@/actions/updateColumnOrder";
import { updateRowOrder } from "@/actions/updateRowOrder";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import CommentBubbleRight, { CommentBubbleLeft } from "../comment/comment-bubble";

interface DataTableProps {
  currentTable: Table;
  initialColumns: Column[];
  initialRows: Row[];
  initialCells: Cell[];
}

export default function TableRoot({
  currentTable,
  initialColumns,
  initialRows,
  initialCells,
}: DataTableProps) {
  const [sortedColumns, setSortedColumns] = useState<Column[]>([]);
  const [sortedRows, setSortedRows] = useState<Row[]>([]);
  useEffect(() => {
    const sortedColumns = initialColumns.slice().sort((a, b) => a.order - b.order).map((col) => col);
    const sortedRows = initialRows.slice().sort((a, b) => a.order - b.order).map((row) => row);
    setSortedColumns(sortedColumns);
    setSortedRows(sortedRows);
  }, [initialColumns, initialRows]);

  const [cells, setCells] = useState<Cell[]>(initialCells);

  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [activeRow, setActiveRow] = useState<Row | null>(null);

  const [overIds, setOverIds] = useState<UniqueIdentifier[]>([]);

  const [isDraggingColumn, setIsDraggingColumn] = useState(false);

  const [lockedColumnIds, setLockedColumnIds] = useState<string[]>([]);
  const [lockedRowIds, setLockedRowIds] = useState<string[]>([]);

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
  }, [sortedColumns, sortedRows]);

  const [isHoveredAddColumnButton, setIsHoveredAddColumnButton] = useState(false);
  const [isHoveredAddRowButton, setIsHoveredAddRowButton] = useState(false);

  const handleCellUpdate = async (cellId: string, newValue: string) => {
    // サーバーアクションを呼び出して Supabase を更新
    const success = await updateCell(cellId, newValue);

    if (!success) {
      console.error(`Failed to update cell with ID: ${cellId}`);
      // 必要に応じて状態を元に戻す
    }
  };

  async function handleAddColumn() {
    const sanitizedRows = sortedRows.map((row) => ({
      ...row,
      is_locked: row.is_locked ?? false, // null を false に変換
    }));

    const newColumnId = await insertColumn(sanitizedRows, currentTable.id, sortedColumns.length);

    if (newColumnId) {
      console.log("New column inserted with ID:", newColumnId);

      // クライアント側の状態に新しい列と対応するセルを追加
      const newColumn: Column = { id: newColumnId, name: `New Column`, is_locked: false, table_id: currentTable.id, order: sortedColumns.length + 1 };
      setSortedColumns((prev) => [...prev, newColumn]);

      const newCells = sortedRows.map((row) => ({
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
    const sanitizedColumns = sortedColumns.map((col) => ({
      ...col,
      is_locked: col.is_locked ?? false, // null を false に変換
    }));

    const newRowId = await insertRow(sanitizedColumns, currentTable.id, sortedRows.length);

    if (newRowId) {
      console.log("New row inserted with ID:", newRowId);

      // ローカル状態に新しい行を追加
      const newRow: Row = { id: newRowId, is_locked: false, table_id: currentTable.id, order: sortedRows.length + 1 };
      setSortedRows((prev) => [...prev, newRow]);

      // ローカル状態に新しいセルを追加
      const newCells = sortedColumns.map((column) => ({
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

  async function handleReorderColumns(activeId: UniqueIdentifier, overIds: UniqueIdentifier) {
    const oldIndex = sortedColumns.findIndex((col) => col.id === activeId.toString());
    const newIndex = sortedColumns.findIndex((col) => col.id === overIds.toString());

    if (oldIndex !== -1 && newIndex !== -1) {
      // 並び替えた結果を作成し、order を更新
      const updatedColumns = arrayMove(sortedColumns, oldIndex, newIndex).map((col, index) => ({
        ...col,
        order: index, // 新しい順序を order に設定
      }));

      setSortedColumns(updatedColumns);

      // サーバーの更新処理（データベース）
      const success = await updateColumnOrder(updatedColumns);
      if (!success) {
        console.error("Failed to update column order");
        return;
      }
    }
  }

  async function handleReorderRows(activeId: UniqueIdentifier, overIds: UniqueIdentifier) {
    const oldIndex = sortedRows.findIndex((row) => row.id === activeId.toString());
    const newIndex = sortedRows.findIndex((row) => row.id === overIds.toString());

    // 並び替えた結果を作成し、order を更新
    const updatedRows = arrayMove(sortedRows, oldIndex, newIndex).map((row, index) => ({
      ...row, // その他のプロパティを保持
      order: index, // 新しい順序を order に設定
    }));

    setSortedRows(updatedRows);

    // データベースの更新を試みる
    const success = await updateRowOrder(updatedRows);
    if (!success) {
      console.error("Failed to update rowumn order");
      return;
    }
  }

  const handleToggleColumnLock = (columnId: string) => {
    setSortedColumns((prevColumns) => {
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
    if (event.active.data.current?.type === 'Column') {
      setIsDraggingColumn(true);
    }

    const { item, type } = event.active.data.current || {};
    if (type === 'Column') {
      const foundColumn = sortedColumns.find((col) => col.id === item.id);
      setActiveColumn(foundColumn || null);
    } else if (type === 'Row') {
      const foundRow = sortedRows.find((row) => row.id === item.id);
      setActiveRow(foundRow || null);
    }
  };

  const handleDragOver = (event: DragMoveEvent) => {
    const { over } = event;
    if (over) {
      setOverIds((prev) => [...prev, over.id]);
    } else {
      setOverIds([]);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    if (event.active.data.current?.type === 'Column') {
      setIsDraggingColumn(false);
    }

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

    setOverIds([]); // ドラッグ終了時にリセット
  };

  const handleChange = (cellId: string, newValue: string) => {
    setCells((prev) =>
      prev.map((cell) =>
        cell.id === cellId ? { ...cell, value: newValue } : cell
      )
    );
  };

  const handleBlur = (cellId: string, value: string) => {
    handleCellUpdate(cellId, value); // サーバーに更新

    // document.activeElement を HTMLElement として扱う
    const activeElement = document.activeElement as HTMLElement | null;
    if (activeElement?.blur) {
      activeElement.blur(); // フォーカスを外す
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    cellId: string,
    value: string
  ) => {
    const isMac = /Mac/.test(navigator.platform);
    const isCmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

    if (isCmdOrCtrl && e.key === "Enter") {
      e.preventDefault();
      handleCellUpdate(cellId, value); // サーバーに更新
      e.currentTarget.blur(); // フォーカスを外す
    }
  };

  return (
    <>
      <div
        className="overflow-x-auto overflow-y-hidden rounded-md shadow-lg max-h-[calc(100px*8+50px)] max-w-[85vw] grid"
        ref={tableRef}
        style={{
          gridTemplateColumns: "100px 1fr", // 1列目は固定幅、2列目は残りスペース
        }}
      >
        <div
          className="min-w-[100px] w-[100px] min-h-[50px] h-[50px] p-2 sticky left-0 top-0 z-[1] shadow-locked-cell"
          style={{ backgroundColor: currentTable.main_color }}
        />
        <div className="flex min-w-full">
          <DndContext
            id='columns'
            modifiers={[restrictToHorizontalAxis]}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragMove={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={sortedColumns}>
              {
                sortedColumns.map((column) => (
                  <TableDraggableHead
                    key={column.id}
                    column={column}
                    columnsLength={sortedColumns.length}
                    mainColor={currentTable.main_color}
                    lockedColumnIds={lockedColumnIds}
                    handleToggleColumnLock={handleToggleColumnLock}
                    sortedRows={sortedRows}
                    sortedColumns={sortedColumns}
                    cells={cells}
                    overIds={overIds}
                    setOverIds={setOverIds}
                  />
                ))}
            </SortableContext>
            {portalContainer &&
              createPortal(
                <DragOverlay>
                  {activeColumn ? (
                    <div className="shadow-dragging">
                      <TableDraggableHead
                        column={activeColumn}
                        columnsLength={sortedColumns.length}
                        mainColor={currentTable.main_color}
                        lockedColumnIds={lockedColumnIds}
                        handleToggleColumnLock={handleToggleColumnLock}
                        isInOverlay={true} // Overlay内スタイル適用
                        sortedRows={sortedRows}
                        sortedColumns={sortedColumns}
                        cells={cells}
                        overIds={overIds}
                        setOverIds={setOverIds}
                      />
                      {sortedRows.map((row) => {
                        const column = sortedColumns.find((col) => col.id === activeColumn.id);
                        if (!column) return null;

                        const cell = cells.find(
                          (cell) => cell.row_id === row.id && cell.column_id === column.id
                        );

                        return (
                          <div
                            key={`${row.id}-${column.id}`}
                            aria-label={`${column.name} ${row.id}`}
                            className={`${row.order !== sortedRows.length - 1 ? "border-b" : ""
                              } px-4 py-3 border-gray-300 flex items-center justify-center min-h-[100px] h-[100px]`}
                            style={{
                              backgroundColor: lockedRowIds.includes(row.id)
                                ? currentTable.sub_color
                                : "#F3F4F6",
                            }}
                          >
                            <Input
                              value={cell?.value || ""}
                              onChange={(e) => handleChange(cell?.id || "", e.target.value)}
                              onBlur={() => handleBlur(cell?.id || "", cell?.value || "")}
                              onKeyDown={(e) =>
                                handleKeyDown(e, cell?.id || "", cell?.value || "")
                              }
                              className="w-full bg-white"
                            />
                          </div>
                        );
                      })}
                    </div>
                  ) : null}
                </DragOverlay>,
                portalContainer
              )
            }
          </DndContext>
        </div>
        <div className="sticky left-0 z-[2]">
          <DndContext
            id='rows'
            modifiers={[restrictToVerticalAxis]}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={sortedRows}>
              {sortedRows
                .map((row) => (
                  <TableDraggableRow
                    key={row.id}
                    row={row}
                    rowsLength={sortedRows.length}
                    subColor={currentTable.sub_color}
                    lockedRowIds={lockedRowIds}
                    handleToggleRowLock={handleToggleRowLock}
                  />
                ))}
            </SortableContext>
            {portalContainer &&
              createPortal(
                <DragOverlay>
                  {activeRow ? (
                    <TableDraggableRow
                      row={activeRow}
                      rowsLength={sortedRows.length}
                      subColor={currentTable.sub_color}
                      lockedRowIds={lockedRowIds}
                      handleToggleRowLock={handleToggleRowLock}
                    />
                  ) : null}
                </DragOverlay>,
                portalContainer
              )
            }
          </DndContext>
        </div>
        <div
          className='grid'
          style={{
            gridTemplateColumns: `repeat(${sortedColumns.length}, minmax(200px, 1fr))`, // 各列の幅を設定
            gridAutoRows: "auto", // 各行の高さを自動調整
          }}
        >
          {sortedRows
            .map((row) =>
              sortedColumns
                .map((column) => {
                  const cell = cells.find(
                    (cell) => cell.row_id === row.id && cell.column_id === column.id
                  );

                  return (
                    <div
                      key={`${row.id}-${column.id}`}
                      aria-label={`${column.name} ${row.id}`}
                      className={`${row.order !== sortedRows.length - 1 ? 'border-b' : ''} ${column.order !== sortedColumns.length - 1 ? 'border-r' : ''} px-4 py-3 border-gray-300 flex items-center justify-center min-h-[100px] h-[100px] relative`}
                      style={{
                        backgroundColor: lockedRowIds.includes(row.id) || lockedColumnIds.includes(column.id) ? currentTable.sub_color : "#F3F4F6",
                        visibility:
                          activeColumn?.id === column.id && isDraggingColumn
                            ||
                            overIds.includes(column.id)
                            ? 'hidden' : undefined,
                      }}
                    >
                      {/* <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger className="absolute right-1 top-1">
                            
                          </TooltipTrigger>
                          <TooltipContent className="bg-white shadow-lg">
                            <p className="font-bold" style={{ color: currentTable.main_color }}>
                              コメントする
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider> */}
                      <Popover>
                        <PopoverTrigger className="absolute right-1 top-1">
                          <MessageCirclePlus
                            size={24}
                            className="text-gray-400 p-1 rounded-sm hover:cursor-pointer transition hover:scale-[1.15]"
                            onMouseEnter={(e) => {
                              // マウスオーバー時にシャドウを変更
                              (e.target as HTMLElement).style.boxShadow = "0 0 3px rgba(0, 0, 0, .5)";
                              (e.target as HTMLElement).style.color = currentTable.main_color;
                            }}
                            onMouseLeave={(e) => {
                              // マウスアウト時に元のシャドウに戻す
                              (e.target as HTMLElement).style.boxShadow = "none";
                              (e.target as HTMLElement).style.color = '#9ca3af';
                            }}
                          />
                        </PopoverTrigger>
                        <PopoverContent
                          className="relative border-2 space-y-4"
                        >
                          <CommentBubbleLeft table={currentTable} initialComment={'コメント'} />
                          <CommentBubbleRight table={currentTable} initialComment={'コメント'} />
                        </PopoverContent>
                      </Popover>
                      <Input
                        value={cell?.value || ""}
                        onChange={(e) => handleChange(cell?.id || "", e.target.value)}
                        onBlur={() => handleBlur(cell?.id || "", cell?.value || "")}
                        onKeyDown={(e) =>
                          handleKeyDown(e, cell?.id || "", cell?.value || "")
                        }
                        className="w-full bg-white hover:shadow-cell hover:scale-105 transition hover:cursor-pointer focus:cursor-text"
                      />
                    </div>
                  );
                })
            )}
        </div>
      </div>
      {tableRect && (
        <>
          {sortedRows.length < 8 ? (
            <Button
              className="p-3 w-fit h-fit shadow-button hover:shadow-lg z-10 fixed"
              style={{
                backgroundColor: currentTable.main_color,
                left: `${tableRect.left + tableRect.width / 2}px`,
                top: `${tableRect.bottom + 16}px`,
                transform: `translateX(-50%) scale(${isHoveredAddRowButton ? 1.15 : 1})`,
                transition: "transform 150ms, scale 150ms",
              }}
              onClick={handleAddRow}
              onMouseEnter={() => setIsHoveredAddRowButton(true)}
              onMouseLeave={() => setIsHoveredAddRowButton(false)}
            >
              <Plus className="min-w-6 min-h-6" />
            </Button>
          ) : (
            <>ページを送るボタン</>
          )}
          <Button
            className="p-3 w-fit h-fit shadow-button hover:shadow-lg z-10 fixed"
            style={{
              backgroundColor: currentTable.main_color,
              left: `${tableRect.right + 16}px`,
              top: `${tableRect.top + tableRect.height / 2}px`,
              transform: `translateY(-50%) scale(${isHoveredAddColumnButton ? 1.15 : 1})`,
              transition: "transform 150ms, scale 150ms",
            }}
            onClick={handleAddColumn}
            onMouseEnter={() => setIsHoveredAddColumnButton(true)}
            onMouseLeave={() => setIsHoveredAddColumnButton(false)}
          >
            <Plus className="min-w-6 min-h-6" />
          </Button>
        </>
      )}
    </>
  );
}
