'use client'
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

interface CommentBubbleProps {
    table: Table;
    initialComment: string;
}

export function CommentBubbleLeft({ table, initialComment }: CommentBubbleProps) {
    const [comment, setComment] = useState(initialComment);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setComment(e.target.value);
    }

    return (
        <div>
            <div className="flex gap-1 items-center">
                <div className="w-6 aspect-square bg-gray-400 rounded-full" />
                <div>名前</div>
            </div>
            <Textarea
                value={comment}
                onChange={(e) => handleChange(e)}
                className="comment-bubble w-[70%] overflow-auto text-white font-bold resize-none border-none bg-transparent focus:ring-0"
                style={{
                    backgroundColor: table.sub_color,
                    marginLeft: "50px",
                }}
            >
                <span
                    className="comment-bubble-tail-back"
                    style={{
                        left: 0,
                        borderWidth: '0 16px 16px 0',
                        borderColor: 'transparent #000000 transparent transparent',
                        translate: '-100% -50%',
                        transform: 'skew(0, 15deg)',
                        transformOrigin: 'right',
                    }}
                />
                <span
                    className="comment-bubble-tail-front"
                    style={{
                        borderColor: `transparent ${table.sub_color} transparent transparent`,
                        left: 0,
                        borderWidth: '0 11.2px 11.2px 0',
                        translate: '-98% -50%',
                        transform: 'skew(0, 15deg)',
                        transformOrigin: 'right',
                    }}
                />
            </Textarea>
        </div>
    )
}

export default function CommentBubbleRight({ table }: CommentBubbleProps) {
    return (
        <div
            className="comment-bubble"
            style={{
                backgroundColor: table.main_color,
                marginLeft: "50px",
            }}
        >
            <span
                className="comment-bubble-tail-back"
                style={{
                    right: 0,
                    borderWidth: '0 0 16px 16px',
                    borderColor: 'transparent transparent transparent #000000',
                    translate: '100% -50%',
                    transform: 'skew(0, -15deg)',
                    transformOrigin: 'left',
                }}
            />
            <span
                className="comment-bubble-tail-front"
                style={{
                    right: 0,
                    borderWidth: '0 0 11.2px 11.2px',
                    borderColor: `transparent transparent transparent ${table.main_color}`,
                    translate: '98% -50%',
                    transform: 'skew(0, -15deg)',
                    transformOrigin: 'left',
                }}
            />
            <span className="text-white font-bold">コメント</span>
        </div>
    )
}