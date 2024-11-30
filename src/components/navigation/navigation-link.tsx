'use client';

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { useState } from "react";

interface NavigationProps {
    member_id: string;
    table: Table;
    currentTableId?: string;
}

const LinkContent = ({
    title,
    isHovered,
    isActive,
    color,
    icon,
    onMouseEnter,
    onMouseLeave,
}: {
    title: string;
    isHovered: boolean;
    isActive: boolean;
    color: string;
    icon: string;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
}) => {
    return (
        <Card
            className="transition shadow-lg border-none group-hover:scale-105"
            style={{
                backgroundColor: isHovered || isActive ? color : "white",
            }}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            <CardContent className="pl-6 pr-10 py-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-8">
                        <div
                            className="p-3 rounded-lg"
                            style={{
                                backgroundColor: color,
                            }}
                        >
                            {icon &&
                                <div
                                    className="w-6 h-6 bg-white transition group-hover:scale-150"
                                    style={{
                                        maskImage: `url(/icons/${icon}.svg)`,
                                        WebkitMaskImage: `url(/icons/${icon}.svg)`, // Safari対応
                                        maskSize: "contain",
                                        WebkitMaskSize: "contain",
                                        maskRepeat: "no-repeat",
                                        WebkitMaskRepeat: "no-repeat",
                                        maskPosition: "center",
                                        WebkitMaskPosition: "center",
                                    }}
                                />
                            }
                        </div>
                        <div>
                            <h2
                                className={`text-xl font-semibold transition ${isHovered || isActive ? "text-white scale-125" : "text-gray-600"
                                    }`}
                            >
                                {title}
                            </h2>
                        </div>
                    </div>
                    {!isActive && (
                        <ArrowRight
                            className="text-gray-400 group-hover:text-white group-hover:translate-x-6 transition group-hover:scale-150"
                        />
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default function NavigationLink({ member_id, table, currentTableId }: NavigationProps) {
    const [isHovered, setIsHovered] = useState(false);

    const isActive = currentTableId === table.id;

    return isActive ? (
        <div>
            <LinkContent
                title={table.name}
                isHovered={isHovered}
                isActive={isActive}
                color={table.main_color}
                icon={table.icon}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            />
        </div>
    ) : (
        <Link href={`/${member_id}/${table.id}`} className="group">
            <LinkContent
                title={table.name}
                isHovered={isHovered}
                isActive={isActive}
                color={table.main_color}
                icon={table.icon}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            />
        </Link>
    );
}
