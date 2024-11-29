'use client';

import { useState, useEffect } from "react";
import NavigationLink from "@/components/navigation/navigation-link";
import { ChevronDown, ChevronLeft } from "lucide-react";
import { usePathname } from "next/navigation";
import config from "@/data/getColor";

// ページ名をマッピングするオブジェクト
const pageName: Record<string, string> = {
  participants: '参加団体',
  booth: '模擬店',
  stage: '屋外ステージ',
  room: '教室',
};

export default function OpenNavigationModal() {
  const [isOpenNavigationModal, setIsOpenNavigationModal] = useState(false);
  const [currentPageName, setCurrentPageName] = useState("");

  const pathname = usePathname();
  const id = pathname.split('/')[1];
  const currentPath = pathname.split('/')[2];

  const { mainColor } = config[currentPath as keyof typeof config] || config.default;

  useEffect(() => {
    // ページ名をリアクティブに更新
    setCurrentPageName(pageName[currentPath] || "");
    setIsOpenNavigationModal(false);
  }, [currentPath]);

  return (
    <>
      {isOpenNavigationModal && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setIsOpenNavigationModal(false)}
        />
      )}
      <div
        className="flex flex-col relative mb-4"
      >
        <div
          className="flex gap-2 w-fit text-nowrap bg-white shadow-md hover:shadow-lg p-4 rounded-lg cursor-pointer text-white font-black z-20 hover:translate-x-3 hover:-translate-y-1 hover:scale-[1.15] transition"
          style={{ backgroundColor: mainColor }}
          onClick={() => setIsOpenNavigationModal(!isOpenNavigationModal)}
        >
          <span>{currentPageName}</span>
          {isOpenNavigationModal ? <ChevronDown size={24} /> : <ChevronLeft size={24} />}
        </div>
        <div
          className={`grid grid-cols-1 md:grid-cols-2 gap-6 w-full mx-auto bg-gray-100 shadow-lg p-10 rounded-lg absolute z-20 top-[calc(56px+16px)] transition-opacity duration-150 ease-in-out ${isOpenNavigationModal ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
        >
          <NavigationLink id={id} currentPath={currentPath} href="participants" title="参加団体" />
          <NavigationLink id={id} currentPath={currentPath} href="booth" title="模擬店" />
          <NavigationLink id={id} currentPath={currentPath} href="stage" title="屋外ステージ" />
          <NavigationLink id={id} currentPath={currentPath} href="room" title="教室" />
        </div>
      </div>
    </>
  );
}
