'use client';

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Store, Users, Music, School } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface NavigationProps {
    id: string;
    href: string;
    title: string;
}

const config = {
    participants: { color: "#3b82f6", Icon: Users }, // 青
    booth: { color: "#10b981", Icon: Store }, // 緑
    stage: { color: "#8b5cf6", Icon: Music }, // 紫
    room: { color: "#facc15", Icon: School }, // 黄色
    default: { color: "#9ca3af", Icon: null }, // 灰色
};

export default function Navigation({ id, href, title }: NavigationProps) {
    const router = useRouter();
    const [isInteractionAllowed, setIsInteractionAllowed] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const hoverAudioRef = useRef<HTMLAudioElement | null>(null);
    const clickAudioRef = useRef<HTMLAudioElement | null>(null);

    const { color, Icon } = config[href as keyof typeof config] || config.default;

    useEffect(() => {
        const handleFirstInteraction = () => {
            setIsInteractionAllowed(true);

            hoverAudioRef.current = new Audio('/audio/hover-sound.mp3');
            clickAudioRef.current = new Audio('/audio/click-sound.mp3');

            document.removeEventListener('click', handleFirstInteraction);
            document.removeEventListener('keydown', handleFirstInteraction);
            document.removeEventListener('touchstart', handleFirstInteraction);
        };

        document.addEventListener('click', handleFirstInteraction);
        document.addEventListener('keydown', handleFirstInteraction);
        document.addEventListener('touchstart', handleFirstInteraction);

        return () => {
            document.removeEventListener('click', handleFirstInteraction);
            document.removeEventListener('keydown', handleFirstInteraction);
            document.removeEventListener('touchstart', handleFirstInteraction);
        };
    }, []);

    const handleMouseEnter = useCallback(() => {
        if (isInteractionAllowed && hoverAudioRef.current) {
            hoverAudioRef.current.currentTime = 0;
            hoverAudioRef.current.play().catch((e) =>
                console.error('Audio playback failed:', e)
            );
        }
    }, [isInteractionAllowed]);

    const handleClick = useCallback(
        (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
            event.preventDefault(); // デフォルトのリンク挙動を防ぐ
            const fullPath = `/${id}/${href}`; // 正しいパスを生成
            if (isInteractionAllowed && clickAudioRef.current) {
                clickAudioRef.current.currentTime = 0;
                clickAudioRef.current.play().catch((e) =>
                    console.error('Audio playback failed:', e)
                );
            }
            setTimeout(() => {
                router.push(fullPath);
            }, 500); // 遷移を遅延させる
        },
        [isInteractionAllowed, router, href]
    );    

    return (
        <>
            <Link href='' className="group" onMouseEnter={handleMouseEnter} onClick={(e) => handleClick(e, id)}>
                <Card
                    className="transition shadow-lg border-none group-hover:scale-105"
                    style={{
                        backgroundColor: isHovered ? color : 'white', // ホバー時に背景色を切り替え
                    }}
                    onMouseEnter={() => setIsHovered(true)} // ホバー時
                    onMouseLeave={() => setIsHovered(false)} // ホバー解除時
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
                                        className="text-xl font-semibold text-gray-600 group-hover:text-white transition group-hover:scale-125"
                                    >
                                        {title}
                                    </h2>
                                </div>
                            </div>
                            <ArrowRight
                                className="text-gray-400 group-hover:text-white group-hover:translate-x-6 transition group-hover:scale-150"
                            />
                        </div>
                    </CardContent>
                </Card>
            </Link>
        </>
    );
}
