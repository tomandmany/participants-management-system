'use client';
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Lock, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSortable } from "@dnd-kit/sortable";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { Input } from "../ui/input";
import { UniqueIdentifier } from "@dnd-kit/core";

interface TableDraggableHeadProps {
  column: Column;
  columnsLength: number;
  mainColor: string;
  lockedColumnIds: string[];
  handleToggleColumnLock: (columnId: string) => void;
  isInOverlay?: boolean; // Overlay内のスタイルを切り替える
  sortedRows: Row[];
  sortedColumns: Column[];
  cells: Cell[];
  overIds: UniqueIdentifier[]; // オーバーされた複数のカラムID
  setOverIds: Dispatch<SetStateAction<UniqueIdentifier[]>>; // 複数のオーバーカラムIDを設定
}

const hexToRgba = (hex: string, alpha: number): string => {
  const [r, g, b] = hex
    .replace("#", "")
    .match(/.{2}/g)!
    .map((val) => parseInt(val, 16));
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export default function TableDraggableHead({
  column,
  columnsLength,
  mainColor,
  lockedColumnIds,
  handleToggleColumnLock,
  isInOverlay = false,
  sortedRows,
  sortedColumns,
  cells,
  overIds,
  setOverIds,
}: TableDraggableHeadProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: "Column",
      item: column,
    },
    disabled: lockedColumnIds.includes(column.id),
  });

  const backgroundColor = isDragging
    ? hexToRgba(mainColor, 0.4)
    : mainColor;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    backgroundColor,
  };

  const baseClasses =
    "hidden text-white min-w-[192px] w-[192px] px-2 py-1 sm:flex items-center justify-between";

  const headRef = useRef<HTMLDivElement>(null);
  const [headRect, setHeadRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (headRef.current) {
      setHeadRect(headRef.current.getBoundingClientRect());
    }
  }, []);

  useEffect(() => {
    if (isDragging) {
      setOverIds((prevIds) => [...new Set([...prevIds, column.id])]);  // 新しいカラムIDを追加
    } else {
      setOverIds((prevIds) => prevIds.filter((id) => id !== column.id));  // ドラッグが終わったらカラムIDを削除
    }
  }, [isDragging, column.id, setOverIds]);

  return (
    <div
      ref={setNodeRef}
      style={style}
    >
      {/* ヘッダー部分 */}
      <div
        ref={headRef}
        className={`
          ${baseClasses}
          ${isDragging ? `border-l-4 border-r-4 border-t-4 border-rose-600` : ""}
          ${isInOverlay ? "" : column.order !== columnsLength - 1 ? "border-r" : ""}
          ${lockedColumnIds.includes(column.id)
            ? "sticky z-10 shadow-locked-cell"
            : ""}
          cursor-grab transition min-w-[192px] w-[192px] min-h-[42px] h-[42px]
        `}
      >
        <div className="flex items-center">
          <GripVertical
            {...attributes}
            {...listeners}
            className={`h-4 w-4 inline mr-2 focus:outline-none ${lockedColumnIds.includes(column.id)
              ? "cursor-not-allowed"
              : "cursor-grab"
              }`}
          />
          <span className="font-black">{column.name}</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleToggleColumnLock(column.id)}
        >
          {lockedColumnIds.includes(column.id) ? <Lock /> : <Unlock />}
        </Button>
      </div>

      {/* ドラッグ中のセル部分 */}
      {isDragging && (
        <div
          className="fixed border-l-4 border-r-4 border-rose-600"
          style={{
            top: `${headRect?.bottom}`,
            backgroundColor: hexToRgba('#ffffff', 0.4),
          }}
        >
          {sortedRows.map((row) => {
            const currentColumn = sortedColumns.find((col) => col.id === column.id);
            if (!currentColumn) return null;

            const cell = cells.find(
              (cell) => cell.row_id === row.id && cell.column_id === currentColumn.id
            );

            return (
              <div
                key={`${row.id}-${currentColumn.id}`}
                aria-label={`${currentColumn.name} ${row.id}`}
                className={`
                  ${row.order !== sortedRows.length - 1 ? "border-b" : ""}
                  ${row.order === sortedRows.length ? "border-b-4 border-rose-600" : ""}
                  px-4 py-3 border-gray-300 flex items-center justify-center min-h-[60px] h-[60px]`}
              >
                <Input
                  value={cell?.value || ""}
                  onChange={() => { }}
                  className="w-full"
                />
              </div>
            );
          })}
        </div>
      )}

      {/* オーバーされているカラムの位置にのみセルを表示 */}
      {(!isDragging && overIds.includes(column.id)) && (
        <div
          className="fixed bg-white"
          style={{
            top: `${headRect?.bottom}`
          }}
        >
          {sortedRows.map((row) => {
            const overColumn = sortedColumns.find((col) => col.id === column.id);
            if (!overColumn) return null;

            const cell = cells.find(
              (cell) => cell.row_id === row.id && cell.column_id === overColumn.id
            );

            if (!cell) return null;

            return (
              <div
                key={`${row.id}-${overColumn.id}`}
                aria-label={`${overColumn.name} ${row.id}`}
                className={`${row.order !== sortedRows.length - 1 ? "border-b" : ""} 
                            px-4 py-3 border-gray-300 flex items-center justify-center min-h-[60px] h-[60px]`}
              >
                <Input
                  value={cell?.value || ""}
                  onChange={() => { }}
                  className="w-full"
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
