'use client';

import { GripVertical, Lock, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";

interface TableDraggableRowProps {
  row: Row;
  rowsLength: number;
  columns: Column[];
  cells: Cell[];
  setCells: React.Dispatch<React.SetStateAction<Cell[]>>;
  subColor: string;
  lockedColumnIds: string[];
  lockedRowIds: string[];
  handleToggleRowLock: (rowId: string) => void;
  handleCellUpdate: (cellId: string, newValue: string) => void;
}

export default function TableDraggableRow({
  row,
  rowsLength,
  columns,
  cells,
  setCells,
  subColor,
  lockedColumnIds,
  lockedRowIds,
  handleToggleRowLock,
  handleCellUpdate,
}: TableDraggableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: row.id,
    data: {
      type: "Row",
      item: row,
    },
    disabled: lockedRowIds.includes(row.id),
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    backgroundColor: subColor,
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
    <div
      ref={setNodeRef}
      style={style}
      className={`${isDragging ? "opacity-40" : ""} ${row.order !== rowsLength - 1 ? 'border-b' : ''} min-h-[60px] h-[60px] min-w-[92px] p-2 sticky left-0 z-10 flex items-center justify-center gap-2 cursor-default shadow-locked-cell`}
    >
      <span
        {...attributes}
        {...listeners}
        className={`${lockedRowIds.includes(row.id) ? "cursor-not-allowed" : "cursor-grab"
          }`}
      >
        <GripVertical />
      </span>
      <Button
        variant="outline"
        size="icon"
        onClick={() => handleToggleRowLock(row.id)}
      >
        {lockedRowIds.includes(row.id) ? <Lock /> : <Unlock />}
      </Button>
    </div>
    // <div
    //   ref={setNodeRef}
    //   style={style}
    //   className={`${isDragging ? "opacity-40" : ""} flex min-h-[60px] h-[60px]`}
    // >
    //   <div
    //     className="min-w-[92px] p-2 sticky left-0 z-10 flex items-center justify-center gap-2 cursor-default shadow-locked-cell [&:not(:last-child)]:border-b"
    //     style={{ backgroundColor: subColor }}
    //   >
    //     <span
    //       {...attributes}
    //       {...listeners}
    //       className={`${lockedRowIds.includes(row.id) ? "cursor-not-allowed" : "cursor-grab"
    //         }`}
    //     >
    //       <GripVertical />
    //     </span>
    //     <Button
    //       variant="outline"
    //       size="icon"
    //       onClick={() => handleToggleRowLock(row.id)}
    //     >
    //       {lockedRowIds.includes(row.id) ? <Lock /> : <Unlock />}
    //     </Button>
    //   </div>
    //   {/* {columns.map((column) => {
    //     const cell = cells.find(
    //       (c) => c.row_id === row.id && c.column_id === column.id
    //     );
    //     if (!cell) return null;
    //     return (
    //       <div
    //         key={column.id}
    //         className={`${lockedColumnIds.includes(column.id)
    //           ? "sticky left-0 z-10 shadow-locked-cell"
    //           : isDragging
    //             ? "border-r-transparent"
    //             : "[&:not(:last-child)]:border-r"
    //           } ${lockedRowIds.includes(row.id) ? "shadow-locked-cell" : "border-b"
    //           } hidden min-w-[192px] w-[192px] px-4 py-3 sm:flex justify-center items-center`}
    //         style={{
    //           backgroundColor:
    //             lockedColumnIds.includes(column.id) ||
    //               lockedRowIds.includes(row.id)
    //               ? subColor
    //               : "#f9fafb",
    //         }}
    //       >
    //         <Input
    //           value={cell.value || ""}
    //           onChange={(e) => handleChange(cell.id, e.target.value)} // 即時反映
    //           onBlur={(e) => handleBlur(cell.id, e.target.value)}
    //           onKeyDown={(e) => handleKeyDown(e, cell.id, e.currentTarget.value)}
    //           className="bg-white hover:scale-105 transition hover:shadow-md"
    //         />
    //       </div>
    //     );
    //   })} */}
    // </div>
  );
}
