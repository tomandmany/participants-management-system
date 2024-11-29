// app/page.tsx
'use client'

import { useState } from 'react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { UniqueIdentifier } from '@dnd-kit/core';

type Item = {
    id: UniqueIdentifier;
    text: string;
};

const SortableItem = ({ id, text }: Item) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="bg-pink-500 cursor-grab h-20 text-center flex items-center justify-center"
            {...attributes}
            {...listeners}
        >
            {text}
        </div>
    );
};

export default function Page() {
    const [items, setItems] = useState<Item[]>([
        { id: '1', text: 'Item 1' },
        { id: '2', text: 'Item 2' },
        { id: '3', text: 'Item 3' },
        { id: '4', text: 'Item 4' },
        { id: '5', text: 'Item 5' },
        { id: '6', text: 'Item 6' },
        { id: '7', text: 'Item 7' },
        { id: '8', text: 'Item 8' },
        { id: '9', text: 'Item 9' },
    ]);

    const handleDragEnd = (event: { active: { id: UniqueIdentifier }; over: { id: UniqueIdentifier } | null }) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setItems((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    return (
        <DndContext
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <SortableContext items={items} strategy={rectSortingStrategy}>
                <div className="container grid grid-cols-3 gap-5 mx-auto px-40">
                    {items.map((item) => (
                        <SortableItem key={item.id} id={item.id} text={item.text} />
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
}
