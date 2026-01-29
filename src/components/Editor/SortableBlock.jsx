import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Block } from "./Block";
import { BlockHandle } from "./BlockHandle";
import { cn } from "../../utils/cn";

/**
 * SortableBlock - Wrapper that makes a block draggable with @dnd-kit
 * Uses Notion-style drop indicator line instead of surrounding border
 */
export function SortableBlock({
    block,
    isActive,
    isSelected,
    isFirstBlock,
    isSingleBlock,
    onContentChange,
    onPropertiesChange,
    onKeyDown,
    onFocus
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
        isOver,
        active
    } = useSortable({ id: block.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition
    };

    // Determine if drop indicator should show above or below
    // If dragging item is after this block, show indicator above
    const showDropIndicator = isOver && !isDragging && active?.id !== block.id;

    return (
        <div
            ref={setNodeRef}
            style={style}
            data-block-id={block.id}
            className={cn("relative group", isDragging && "z-50 opacity-30")}
        >
            {/* Notion-style drop indicator line - shows above block */}
            {showDropIndicator && (
                <div
                    className="absolute left-0 right-0 h-0.5 bg-blue-500 rounded-full z-50"
                    style={{
                        top: "-2px",
                        left: "-8px",
                        right: "-8px"
                    }}
                />
            )}

            {/* Selection highlight - Notion style */}
            {isSelected && (
                <div
                    className="absolute inset-0 bg-blue-100/60 rounded-sm pointer-events-none"
                    style={{
                        left: "-8px",
                        right: "-8px",
                        top: "-2px",
                        bottom: "-2px",
                        borderRadius: "3px"
                    }}
                />
            )}

            {/* Drag Handle */}
            <BlockHandle
                listeners={listeners}
                attributes={attributes}
                isDragging={isDragging}
            />

            {/* Block Content - no ring styling when dragging */}
            <div className="relative">
                <Block
                    block={block}
                    isActive={isActive}
                    isFirstBlock={isFirstBlock}
                    isSingleBlock={isSingleBlock}
                    onContentChange={onContentChange}
                    onPropertiesChange={onPropertiesChange}
                    onKeyDown={onKeyDown}
                    onFocus={onFocus}
                />
            </div>
        </div>
    );
}
