import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Lock, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSortable } from "@dnd-kit/sortable";

interface DraggableTableHeadProps {
  column: Column;
  mainColor: string;
  lockedColumnIds: string[];
  handleToggleColumnLock: (columnId: string) => void;
}

export default function DraggableTableHead({
  column,
  mainColor,
  lockedColumnIds,
  handleToggleColumnLock,
}: DraggableTableHeadProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
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

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`${lockedColumnIds.includes(column.id) ? "sticky left-0 z-10" : "border-r"} hidden text-white min-w-[192px] px-2 py-1 border-white sm:flex items-center justify-between opacity-40`}
      >
        <div className="flex items-center">
          <GripVertical
            className={`${lockedColumnIds.includes(column.id) ? "cursor-not-allowed" : isDragging ? "cursor-grabbing" : 'cursor-grab'} h-4 w-4 inline mr-2 focus:outline-none`}
          />
          <span className="font-black">{column.name}</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
        >
          {lockedColumnIds.includes(column.id) ? <Lock /> : <Unlock />}
        </Button>
      </div>
    )
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={`${lockedColumnIds.includes(column.id) ? "sticky left-px z-10 shadow-locked-cell" : isDragging ? 'border-r-transparent' : ''} border-r hidden text-white min-w-[192px] px-2 py-1 border-white sm:flex items-center justify-between`}
      >
        <div className="flex items-center">
          <GripVertical
            {...attributes}
            {...listeners}
            className={`${lockedColumnIds.includes(column.id) ? "cursor-not-allowed" : isDragging ? 'cursor-grabbing' : "cursor-grab"} h-4 w-4 inline mr-2 focus:outline-none`}
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
    </>
  );
}
