// 'use client';
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table"
// import { Input } from "@/components/ui/input"
// import { Button } from "@/components/ui/button"
// import { Plus, Trash2, Lock, Unlock, GripVertical, ChevronDown, ChevronUp } from 'lucide-react'
// import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
// import { useState, useEffect, useCallback, Fragment } from "react";
// import { usePathname } from "next/navigation";
// import { config } from "@/components/navigation/navigation-link";

// interface DataTableProps {
//   initialColumns: (keyof GroupData)[];
//   initialData: GroupData[];
// }

// type ColorFormat = string; // RGB, HSL, HEX のいずれか
// type LightenValue = number; // 0 ～ 100 の範囲で色を薄くする度合い

// /**
//  * 色を薄くする汎用関数
//  * @param color - RGB, HSL, または HEX の色コード
//  * @param amount - 色を薄くする度合い (0 ～ 100 の範囲)
//  * @returns 薄くした色 (HSL または RGB 形式)
//  */
// const lightenColor = (color: ColorFormat, amount: LightenValue): string => {
//   if (color.startsWith("hsl")) {
//     // HSL の場合
//     const [h, s, l] = color
//       .match(/\d+/g)!
//       .map(Number) as [number, number, number];
//     return `hsl(${h}, ${s}%, ${Math.min(l + amount, 100)}%)`;
//   }

//   if (color.startsWith("rgb")) {
//     // RGB の場合
//     const [r, g, b] = color.match(/\d+/g)!.map(Number);
//     const lighten = (c: number) => Math.min(c + (amount / 100) * 255, 255);
//     return `rgb(${lighten(r)}, ${lighten(g)}, ${lighten(b)})`;
//   }

//   if (color.startsWith("#")) {
//     // HEX の場合
//     const r = parseInt(color.slice(1, 3), 16);
//     const g = parseInt(color.slice(3, 5), 16);
//     const b = parseInt(color.slice(5, 7), 16);
//     const lighten = (c: number) => Math.min(c + (amount / 100) * 255, 255);
//     return `rgb(${lighten(r)}, ${lighten(g)}, ${lighten(b)})`;
//   }

//   throw new Error("Unsupported color format");
// };

// export default function TableRoot({
//   initialColumns,
//   initialData,
// }: DataTableProps) {
//   const [expandedRows, setExpandedRows] = useState<number[]>([])
//   const [columns, setColumns] = useState<(keyof GroupData)[]>(initialColumns);
//   const [data, setData] = useState<GroupData[]>(initialData);
//   const [frozenRows, setFrozenRows] = useState<number[]>([]);
//   const [frozenColumns, setFrozenColumns] = useState<number[]>([]);

//   const pathname = usePathname();
//   const currentPath = pathname.split('/')[2];

//   const { color } = config[currentPath as keyof typeof config] || config.default;
//   const lightenAmount = (() => {
//     switch (currentPath) {
//       case "participants":
//         return 30;
//       case "booth":
//         return 22;
//       case "stage":
//         return 25;
//       case "room":
//         return 45;
//       default:
//         return 10;
//     }
//   });

//   const saveData = useCallback(async () => {
//     await new Promise((resolve) => setTimeout(resolve, 500));
//   }, [data, columns]);

//   useEffect(() => {
//     const debounce = setTimeout(() => {
//       saveData();
//     }, 2000);

//     return () => clearTimeout(debounce);
//   }, [data, columns, saveData]);

//   const handleUpdate = (rowIndex: number, columnId: keyof GroupData, value: string) => {
//     setData((prevData) => {
//       const newData = [...prevData];
//       newData[rowIndex] = { ...newData[rowIndex], [columnId]: value };
//       return newData;
//     });
//   };

//   const handleAddRow = () => {
//     setData((prevData) => [
//       ...prevData,
//       { 団体名: "", 代表者: "", 連絡先: "", 活動内容: "", あいうえお: "", かきくけこ: "", さしすせそ: "" },
//     ]);
//   };

//   const handleDeleteRow = (rowIndex: number) => {
//     setData((prevData) => prevData.filter((_, index) => index !== rowIndex));
//     if (frozenRows.includes(rowIndex)) {
//       setFrozenRows((prev) => prev.filter((index) => index !== rowIndex));
//     }
//   };

//   const handleReorderRows = (startIndex: number, endIndex: number) => {
//     setData((prevData) => {
//       const result = Array.from(prevData);
//       const [removed] = result.splice(startIndex, 1);
//       result.splice(endIndex, 0, removed);
//       return result;
//     });
//   };

//   const handleReorderColumns = (startIndex: number, endIndex: number) => {
//     setColumns((prevColumns) => {
//       const result = Array.from(prevColumns);
//       const [removed] = result.splice(startIndex, 1);
//       result.splice(endIndex, 0, removed);
//       return result;
//     });
//   };

//   const handleToggleRowFreeze = (rowIndex: number) => {
//     setFrozenRows((prev) =>
//       prev.includes(rowIndex)
//         ? prev.filter((index) => index !== rowIndex) // Unlock Row
//         : [...prev, rowIndex] // Lock Row
//     );
//     console.log('frozenRows:', frozenRows);
//   };

//   const handleToggleColumnFreeze = (columnIndex: number) => {
//     setFrozenColumns((prev) =>
//       prev.includes(columnIndex)
//         ? prev.filter((index) => index !== columnIndex) // Unlock column
//         : [...prev, columnIndex] // Lock column
//     );
//   };

//   const handleDragEnd = (result: any) => {
//     if (!result.destination) {
//       return
//     }

//     if (result.type === 'row') {
//       handleReorderRows(result.source.index, result.destination.index)
//     } else if (result.type === 'column') {
//       handleReorderColumns(result.source.index, result.destination.index)
//     }
//   }

//   const toggleRowExpansion = (rowIndex: number) => {
//     setExpandedRows((prev) =>
//       prev.includes(rowIndex)
//         ? prev.filter((i) => i !== rowIndex)
//         : [...prev, rowIndex]
//     )
//   }

//   return (
//     <DragDropContext onDragEnd={handleDragEnd}>
//       <div className="overflow-x-auto rounded-md border-2 border-white">
//         <Table className="bg-white border-separate -m-[2px]">
//           <Droppable droppableId="columns" direction="horizontal" type="column">
//             {(provided) => (
//               <TableHeader
//                 ref={provided.innerRef}
//                 style={{ backgroundColor: color }}
//                 {...provided.droppableProps}
//               >
//                 <TableRow>
//                   <TableHead
//                     className="w-[50px] lg:w-[100px] sticky left-0 z-10 rounded-tl-sm"
//                     style={{ backgroundColor: color }}
//                   />
//                   {columns.map((column, columnIndex) => (
//                     <Draggable key={column} draggableId={column} index={columnIndex} isDragDisabled={frozenColumns.includes(columnIndex)}>
//                       {(provided, snapshot) => (
//                         <TableHead
//                           ref={provided.innerRef}
//                           {...provided.draggableProps}
//                           className={`${frozenColumns.includes(columnIndex) ? "sticky left-0 z-10" : ""} ${snapshot.isDragging ? "opacity-50" : ""} hidden sm:table-cell text-white`}
//                           style={{ backgroundColor: color }}
//                         >
//                           <div className="flex items-center justify-between">
//                             <span {...provided.dragHandleProps} className=" font-black">
//                               <GripVertical className="h-4 w-4 inline mr-2" />
//                               {column}
//                             </span>
//                             <Button
//                               variant="ghost"
//                               size="icon"
//                               onClick={() => handleToggleColumnFreeze(columnIndex)}
//                             >
//                               {frozenColumns.includes(columnIndex) ? <Lock /> : <Unlock />}
//                             </Button>
//                           </div>
//                         </TableHead>
//                       )}
//                     </Draggable>
//                   ))}
//                   {provided.placeholder}
//                   <TableHead
//                     className="w-[100px] sticky right-0 z-10 rounded-tr-sm"
//                     style={{ backgroundColor: color }}
//                   />
//                 </TableRow>
//               </TableHeader>
//             )}
//           </Droppable>
//           <Droppable droppableId="rows" type="row">
//             {(provided) => (
//               <TableBody ref={provided.innerRef} {...provided.droppableProps}>
//                 {data.map((row, rowIndex) => (
//                   <Fragment key={rowIndex}>
//                     <Draggable draggableId={rowIndex.toString()} index={rowIndex} isDragDisabled={frozenRows.includes(rowIndex)}>
//                       {(provided, snapshot) => (
//                         <TableRow
//                           ref={provided.innerRef}
//                           {...provided.draggableProps}
//                           className={`${frozenRows.includes(rowIndex) ? "sticky top-0 z-10" : ""} ${snapshot.isDragging ? "opacity-50" : ""} bg-gray-50`}
//                           style={{ backgroundColor: frozenRows.includes(rowIndex) ? lightenColor(color, lightenAmount()) : "#f9fafb" }}
//                         >
//                           <TableCell
//                             className="w-[50px] lg:w-[100px] sticky left-0 z-10 rounded-bl-sm"
//                             style={{ backgroundColor: lightenColor(color, lightenAmount()) }}
//                           >
//                             <div className="flex items-center space-x-2">
//                               <span {...provided.dragHandleProps} className="cursor-move">
//                                 <GripVertical />
//                               </span>
//                               <Button
//                                 variant="outline"
//                                 size="icon"
//                                 onClick={() => handleToggleRowFreeze(rowIndex)}
//                                 aria-label={`${frozenRows.includes(rowIndex) ? "Unfreeze" : "Freeze"} row ${rowIndex + 1}`}
//                               >
//                                 {frozenRows.includes(rowIndex) ? <Lock /> : <Unlock />}
//                               </Button>
//                               <Button
//                                 variant="ghost"
//                                 size="icon"
//                                 className="sm:hidden"
//                                 onClick={() => toggleRowExpansion(rowIndex)}
//                                 aria-label={`${expandedRows.includes(rowIndex) ? "Collapse" : "Expand"} row ${rowIndex + 1}`}
//                               >
//                                 {expandedRows.includes(rowIndex) ? <ChevronUp /> : <ChevronDown />}
//                               </Button>
//                             </div>
//                           </TableCell>
//                           {columns.map((column, columnIndex) => (
//                             <TableCell
//                               key={column}
//                               className={`${frozenColumns.includes(columnIndex) || frozenRows.includes(rowIndex) ? "sticky left-0 z-10" : ""} hidden sm:table-cell min-w-[200px]`}
//                               style={{ backgroundColor: frozenColumns.includes(columnIndex) || frozenRows.includes(rowIndex) ? lightenColor(color, lightenAmount()) : "#f9fafb" }}
//                             >
//                               <Input
//                                 value={row[column] || ""}
//                                 onChange={(e) => handleUpdate(rowIndex, column, e.target.value)}
//                                 aria-label={`${column} for row ${rowIndex + 1}`}
//                                 className="bg-white"
//                               />
//                             </TableCell>
//                           ))}
//                           <TableCell
//                             className="text-center sticky right-0 z-10 rounded-br-sm"
//                             style={{ backgroundColor: lightenColor(color, lightenAmount()) }}
//                           >
//                             <Button
//                               variant="outline"
//                               size="sm"
//                               onClick={() => handleDeleteRow(rowIndex)}
//                               aria-label={`Delete row ${rowIndex + 1}`}
//                               className="px-2 w-fit mx-auto hover:bg-red-500 hover:border-red-500 hover:text-white"
//                             >
//                               <Trash2 />
//                             </Button>
//                           </TableCell>
//                         </TableRow>
//                       )}
//                     </Draggable>
//                     {expandedRows.includes(rowIndex) && (
//                       <TableRow className="sm:hidden">
//                         <TableCell colSpan={columns.length + 2}>
//                           <div className="space-y-2">
//                             {columns.map((column) => (
//                               <div key={column} className="flex flex-col">
//                                 <span className="font-medium">{column}:</span>
//                                 <Input
//                                   value={row[column] || ""}
//                                   onChange={(e) => handleUpdate(rowIndex, column, e.target.value)}
//                                   aria-label={`${column} for row ${rowIndex + 1}`}
//                                 />
//                               </div>
//                             ))}
//                           </div>
//                         </TableCell>
//                       </TableRow>
//                     )}
//                   </Fragment>
//                 ))}
//                 {provided.placeholder}
//               </TableBody>
//             )}
//           </Droppable>
//         </Table>
//       </div>
//       <div className="p-4">
//         <Button onClick={handleAddRow}>
//           <Plus className="mr-2 h-4 w-4" /> Add Row
//         </Button>
//       </div>
//     </DragDropContext>
//   )
// }

