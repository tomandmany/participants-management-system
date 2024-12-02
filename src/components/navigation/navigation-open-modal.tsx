'use client';

import { useState, useEffect, useRef } from "react";
import NavigationLink from "@/components/navigation/navigation-link";
import { ChevronDown, ChevronLeft } from "lucide-react";

interface NavigationOpenProps {
  member_id: string;
  tables: Table[];
  currentTable: Table;
}

export default function NavigationOpenModal({ member_id, tables, currentTable }: NavigationOpenProps) {
  const [isNavigationOpenModal, setIsNavigationOpenModal] = useState(false);
  const [currentTableName, setCurrentTableName] = useState<string>('');
  const toggleButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // ページ名をリアクティブに更新
    setCurrentTableName(currentTable.name);
    setIsNavigationOpenModal(false);
  }, [currentTable]);

  return (
    <>
      {isNavigationOpenModal && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setIsNavigationOpenModal(false)}
        />
      )}
      <div className="flex flex-col relative mb-4">
        <div
          className="flex gap-2 w-fit text-nowrap bg-white shadow-md hover:shadow-lg p-4 rounded-lg cursor-pointer text-white font-black z-20 hover:scale-[1.15] transition"
          style={{ backgroundColor: currentTable.main_color }}
          onClick={() => setIsNavigationOpenModal(!isNavigationOpenModal)}
          ref={toggleButtonRef}
        >
          <span>{currentTableName}</span>
          {isNavigationOpenModal ? <ChevronDown size={24} /> : <ChevronLeft size={24} />}
        </div>
        <div
          className={`${isNavigationOpenModal ? "opacity-100" : "opacity-0 pointer-events-none"} w-[85vw] grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-100 shadow-lg p-16 rounded-md absolute left-1/2 -translate-x-1/2 top-[calc(56px+16px)] z-20 transition-opacity duration-150 ease-in-out`}
        >
          {tables.map((table) => (
            <NavigationLink key={table.id} member_id={member_id} table={table} currentTableId={currentTable.id} />
          ))}
        </div>
      </div>
    </>
  );
}
