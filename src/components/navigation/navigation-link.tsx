'use client';

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import config from "@/data/getColor";

interface NavigationProps {
    id: string;
    title: string;
    href: string;
    currentPath?: string;
}

const LinkContent = ({
    title,
    isHovered,
    isActive,
    color,
    Icon,
    onMouseEnter,
    onMouseLeave,
}: {
    title: string;
    isHovered: boolean;
    isActive: boolean;
    color: string;
    Icon: React.ComponentType<{ className?: string }> | null;
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
                            {Icon && <Icon className="w-6 h-6 text-white transition group-hover:scale-150" />}
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

export default function NavigationLink({ id, title, href, currentPath }: NavigationProps) {
    const [isHovered, setIsHovered] = useState(false);
    const { mainColor, Icon } = config[href as keyof typeof config] || config.default;

    const isActive = currentPath === href;

    return isActive ? (
        <div>
            <LinkContent
                title={title}
                isHovered={isHovered}
                isActive={isActive}
                color={mainColor}
                Icon={Icon}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            />
        </div>
    ) : (
        <Link href={`/${id}/${href}`} className="group">
            <LinkContent
                title={title}
                isHovered={isHovered}
                isActive={isActive}
                color={mainColor}
                Icon={Icon}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            />
        </Link>
    );
}
