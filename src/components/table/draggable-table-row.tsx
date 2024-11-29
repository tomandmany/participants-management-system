import { GripVertical, Lock, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";

interface DraggableTableRowProps {
  row: Row;
  columns: Column[];
  cells: Cell[];
  subColor: string;
  lockedColumnIds: string[];
  lockedRowIds: string[];
  handleToggleRowLock: (rowId: string) => void;
  handleCellUpdate: (cellId: string, newValue: string) => void;
}

export default function DraggableTableRow({
  row,
  columns,
  cells,
  subColor,
  lockedColumnIds,
  lockedRowIds,
  handleToggleRowLock,
  handleCellUpdate = () => { }, // 空関数をデフォルト設定
}: DraggableTableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
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

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className='opacity-40 flex [&>div:not(:first-child,:last-child)]:border-b'
      >
        <div
          className="min-w-[92px] p-2 sticky left-0 z-10 flex items-center justify-center gap-2 border-r border-b border-gray-400 cursor-default"
          style={{ backgroundColor: subColor }}
        >
          <span
            {...attributes}
            {...listeners}
            className={`${lockedRowIds.includes(row.id) ? "cursor-not-allowed" : "cursor-grab"} `}
          >
            <GripVertical />
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleToggleRowLock(row.id)}
            aria-label={`${lockedRowIds.includes(row.id) ? "Unfreeze" : "Freeze"} row ${row.id}`}
          >
            {lockedColumnIds.includes(row.id) ? <Lock /> : <Unlock />}
          </Button>
        </div>
        {columns.map((column) => {
          const cell = cells.find((c) => c.rowId === row.id && c.columnId === column.id);
          return (
            <div
              key={column.id}
              className='hidden min-w-[192px] px-4 py-3 border-r sm:flex justify-center items-center'
              style={{
                backgroundColor: lockedColumnIds.includes(column.id) || lockedRowIds.includes(row.id)
                  ? subColor
                  : "#f9fafb",
              }}
            >
              <Input
                value={cell?.value || ""}
                onChange={(e) => cell && handleCellUpdate(cell.id, e.target.value)}
                aria-label={`${column.name} for row ${row.id}`}
                className="bg-white hover:scale-105 transition hover:shadow-md"
              />
            </div>
          );
        })}
        {/* <div
          className="text-center sticky right-0 z-10 min-w-[52px] p-2 border-l border-b border-gray-400 -ml-px flex justify-center items-center"
          style={{ backgroundColor: subColor }}
        >
          <Button
            variant="outline"
            size="sm"
            // onClick={() => handleDeleteRow(row.id)}
            aria-label={`Delete row ${row.id}`}
            className="px-2 w-fit mx-auto hover:bg-red-500 hover:border-red-500 hover:text-white"
          >
            <Trash2 />
          </Button>
        </div> */}
      </div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className='flex [&>div:not(:first-child,:last-child)]:border-b'
    >
      <div
        className="min-w-[92px] p-2 sticky left-0 z-10 flex items-center justify-center gap-2 border-b cursor-default shadow-locked-cell"
        style={{ backgroundColor: subColor }}
      >
        <span
          {...attributes}
          {...listeners}
          className={`${lockedRowIds.includes(row.id) ? "cursor-not-allowed" : "cursor-grab"} `}
        >
          <GripVertical />
        </span>
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleToggleRowLock(row.id)}
          aria-label={`${lockedRowIds.includes(row.id) ? "Unfreeze" : "Freeze"} row ${row.id}`}
        >
          {lockedRowIds.includes(row.id) ? <Lock /> : <Unlock />}
        </Button>
      </div>
      {columns.map((column) => {
        const cell = cells.find((c) => c.rowId === row.id && c.columnId === column.id);
        return (
          <div
            key={column.id}
            className={`${lockedColumnIds.includes(column.id) ? "sticky left-0 z-10 shadow-locked-cell" : "border-r"} hidden min-w-[192px] px-4 py-3 sm:flex justify-center items-center`}
            style={{
              backgroundColor: lockedColumnIds.includes(column.id) || lockedRowIds.includes(row.id)
                ? subColor
                : "#f9fafb",
            }}
          >
            <Input
              value={cell?.value || ""}
              onChange={(e) => cell && handleCellUpdate(cell.id, e.target.value)}
              aria-label={`${column.name} for row ${row.id}`}
              className="bg-white hover:scale-105 transition hover:shadow-md"
            />
          </div>
        );
      })}
      {/* <div
        className="text-center sticky right-0 z-10 min-w-[52px] p-2 border-l border-b border-gray-400 -ml-px flex justify-center items-center"
        style={{ backgroundColor: subColor }}
      >
        <Button
          variant="outline"
          size="sm"
          // onClick={() => handleDeleteRow(row.id)}
          aria-label={`Delete row ${row.id}`}
          className="px-2 w-fit mx-auto hover:bg-red-500 hover:border-red-500 hover:text-white"
        >
          <Trash2 />
        </Button>
      </div> */}
    </div>
  );
}
