import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Lock, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSortable } from "@dnd-kit/sortable";

interface TableDraggableHeadProps {
  column: Column;
  mainColor: string;
  lockedColumnIds: string[];
  handleToggleColumnLock: (columnId: string) => void;
}

export default function TableDraggableHead({
  column,
  mainColor,
  lockedColumnIds,
  handleToggleColumnLock,
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

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    backgroundColor: mainColor,
  };

  const baseClasses =
    "hidden text-white min-w-[192px] w-[192px] px-2 py-1 sm:flex items-center justify-between";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${baseClasses} ${
        lockedColumnIds.includes(column.id)
          ? "sticky left-px z-10 shadow-locked-cell"
          : isDragging
          ? "border-r-transparent" // ドラッグ中の右線を非表示
          : "border-r"
      } ${isDragging ? "opacity-40 cursor-grabbing" : "cursor-grab"}`}
    >
      <div className="flex items-center">
        <GripVertical
          {...attributes}
          {...listeners}
          className={`h-4 w-4 inline mr-2 focus:outline-none ${
            lockedColumnIds.includes(column.id)
              ? "cursor-not-allowed"
              : isDragging
              ? "cursor-grabbing"
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
  );
}
