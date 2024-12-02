import { CSS } from "@dnd-kit/utilities";
import { Lock, MoveHorizontal, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSortable } from "@dnd-kit/sortable";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { Input } from "../ui/input";
import { UniqueIdentifier } from "@dnd-kit/core";
import { updateColumnName } from "@/actions/updateColumnName";

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
    "hidden text-white min-w-[200px] w-[200px] px-2 py-1 sm:flex items-center justify-between";

  const headRef = useRef<HTMLDivElement>(null);
  const [headRect, setHeadRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (headRef.current) {
      setHeadRect(headRef.current.getBoundingClientRect());
    }
  }, []);

  const [previousOverId, setPreviousOverId] = useState<UniqueIdentifier | null>(null);

  // overIds が変更されるたびに直前の overId を更新
  useEffect(() => {
    if (overIds.length > 0) {
      // 最新のoverIdを取得し、更新
      setPreviousOverId(overIds[overIds.length - 1]);
    } else {
      // overIdsが空の場合はnullに戻す
      setPreviousOverId(null);
    }
  }, [overIds]);

  const [columnName, setColumnName] = useState(column.name);

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
          ${isInOverlay ? "" : column.order !== columnsLength - 1 ? (previousOverId === column.id ? "" : "border-r") : ""}
          ${lockedColumnIds.includes(column.id)
            ? "sticky z-10 shadow-locked-cell"
            : ""}
          transition min-w-[200px] w-[200px] min-h-[50px] h-[50px]
        `}
      >
        <div className="flex items-center">
          <MoveHorizontal
            {...attributes}
            {...listeners}
            className={`min-h-4 min-w-4 inline focus:outline-none hover:shadow-button transition rounded-lg p-1
              ${lockedColumnIds.includes(column.id)
                ? "cursor-not-allowed"
                : "cursor-grab"
              }
              ${isInOverlay
                ? "cursor-grabbing"
                : ""
              }
              `
            }
          />
          <Input
            value={columnName || ""}
            onChange={(e) => setColumnName(e.target.value)}
            onBlur={async () => {
              try {
                // 名前更新処理
                const success = await updateColumnName(column.id, columnName);
                if (!success) {
                  console.error(`Failed to update column name with ID: ${column.id}`);
                }
              } catch (error) {
                console.error("Error updating column name:", error);
              }

              // フォーカスを外す処理
              const activeElement = document.activeElement as HTMLElement | null;
              if (activeElement && activeElement.blur) {
                activeElement.blur();
              }
            }}
            onKeyDown={async (e) => {
              const isMac = /Mac/.test(navigator.platform);
              const isCmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

              if (isCmdOrCtrl && e.key === "Enter") {
                e.preventDefault();  // デフォルトのEnter処理をキャンセル

                try {
                  // 名前更新処理
                  const success = await updateColumnName(column.id, columnName);
                  if (!success) {
                    console.error(`Failed to update column name with ID: ${column.id}`);
                  }
                } catch (error) {
                  console.error("Error updating column name:", error);
                }

                // フォーカスを外す
                const activeElement = document.activeElement as HTMLElement | null;
                if (activeElement && activeElement.blur) {
                  activeElement.blur();
                }
              }
            }}
            className="font-black border-none hover:shadow-button hover:cursor-pointer focus:cursor-text focus-visible:ring-white px-2 py-1 h-fit shadow-none transition"
          />
        </div>
        <Button
          variant="ghost"
          onClick={() => handleToggleColumnLock(column.id)}
          className={`${lockedColumnIds.includes(column.id) ? 'border-white' : 'border-transparent'} border-[1.5px] h-2 w-2 p-4 hover:bg-transparent hover:text-white shadow-black hover:shadow-button transition`}
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
            backgroundColor: hexToRgba('#F3F4F6', 0.4),
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
                  ${row.order === sortedRows.length - 1 ? "border-b-4 border-rose-600" : ""}
                  px-4 py-3 border-gray-300 flex items-center justify-center min-h-[100px] h-[100px]`}
                style={{
                  backgroundColor: hexToRgba('#F3F4F6', 0.4),
                  color: hexToRgba('#000000', 0.4),
                }}
              >
                <Input
                  value={cell?.value || ""}
                  onChange={() => { }}
                  className="w-full bg-white"
                />
              </div>
            );
          })}
        </div>
      )}

      {/* オーバーされているカラムの位置にのみセルを表示 */}
      {(!isDragging && overIds.includes(column.id)) && (
        <div
          className="fixed"
          style={{
            top: `${headRect?.bottom}`,
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
                            px-4 py-3 border-gray-300 flex items-center justify-center min-h-[100px] h-[100px] bg-[#F3F4F6] border-r`}
              >
                <Input
                  value={cell?.value || ""}
                  onChange={() => { }}
                  className="w-full bg-white"
                />
              </div>
            );
          })}
        </div>
      )}
    </div >
  );
}
