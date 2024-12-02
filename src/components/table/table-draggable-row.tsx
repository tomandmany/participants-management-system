'use client';

import { Lock, MoveVertical, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";

interface TableDraggableRowProps {
  row: Row;
  rowsLength: number;
  subColor: string;
  lockedRowIds: string[];
  handleToggleRowLock: (rowId: string) => void;
}

export default function TableDraggableRow({
  row,
  rowsLength,
  subColor,
  lockedRowIds,
  handleToggleRowLock,
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${isDragging ? "opacity-40" : ""} ${row.order !== rowsLength - 1 ? 'border-b' : ''} min-h-[100px] h-[100px] min-w-[100px] p-2 sticky left-0 z-10 flex items-center justify-center gap-2 cursor-default shadow-locked-cell`}
    >
      <span
        {...attributes}
        {...listeners}
        className={`${lockedRowIds.includes(row.id) ? "cursor-not-allowed" : "cursor-grab"
          }`}
      >
        <MoveVertical className="min-w-6 min-h-6 text-white hover:shadow-button transition rounded-lg p-1" />
      </span>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleToggleRowLock(row.id)}
        className={`${lockedRowIds.includes(row.id) ? 'border-white' : 'border-transparent'} border-[1.5px] h-2 w-2 p-4 text-white hover:bg-transparent hover:text-white shadow-black hover:shadow-button transition`}
      >
        {lockedRowIds.includes(row.id) ? <Lock /> : <Unlock />}
      </Button>
    </div>
  );
}
