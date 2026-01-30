import { useRef, useEffect, useCallback } from "react";
import { cn } from "../../../utils/cn";
import { useEditorStore } from "../../../stores/editorStore";
import { BLOCK_TYPES } from "../../../constants/BLOCK_TYPES";

/**
 * NestedBlock - Renders an editable block inside a container (Columns/Tabs)
 * Uses uncontrolled contentEditable to avoid cursor reset issues
 */
export function NestedBlock({ blockId }) {
    const contentRef = useRef(null);
    const initialContentRef = useRef(null);

    const {
        document: doc,
        activeBlockId,
        setActiveBlock,
        updateNestedBlock
    } = useEditorStore();

    // Find the block data
    const block = doc.blocks.find((b) => b.id === blockId);
    const isActive = activeBlockId === blockId;

    // Store initial content to detect changes
    useEffect(() => {
        if (block && initialContentRef.current === null) {
            initialContentRef.current = block.content || "";
        }
    }, [block]);

    // Set initial content only once when mounted
    useEffect(() => {
        if (contentRef.current && block) {
            // Only set if element is empty (first mount)
            if (contentRef.current.innerHTML === "") {
                contentRef.current.innerHTML = block.content || "";
            }
        }
    }, [block]);

    // Save content on blur - this is when we persist changes
    const handleBlur = useCallback(() => {
        if (contentRef.current) {
            const newContent = contentRef.current.innerHTML;
            if (newContent !== initialContentRef.current) {
                updateNestedBlock(blockId, { content: newContent });
                initialContentRef.current = newContent;
            }
        }
    }, [blockId, updateNestedBlock]);

    // Handle focus
    const handleFocus = useCallback(() => {
        setActiveBlock(blockId);
    }, [blockId, setActiveBlock]);

    // Handle key events
    const handleKeyDown = useCallback((e) => {
        // Prevent Enter from creating new blocks (keep content inline for now)
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            document.execCommand("insertLineBreak");
        }

        // Stop propagation to prevent parent container from handling
        e.stopPropagation();
    }, []);

    // Handle checkbox change for tasks
    const handleCheckboxChange = useCallback(
        (e) => {
            if (!block) return;
            updateNestedBlock(blockId, {
                properties: {
                    ...block.properties,
                    checked: e.target.checked
                }
            });
        },
        [block, blockId, updateNestedBlock]
    );

    // Early return AFTER all hooks are called
    if (!block) {
        return (
            <div className="p-2 text-gray-400 text-sm italic">
                Block not found
            </div>
        );
    }

    // Get class names based on block type
    const getContentClass = () => {
        switch (block.type) {
            case BLOCK_TYPES.HEADING_1:
                return "outline-none min-h-[1.5em] text-2xl font-bold text-gray-900";
            case BLOCK_TYPES.HEADING_2:
                return "outline-none min-h-[1.5em] text-xl font-semibold text-gray-900";
            case BLOCK_TYPES.HEADING_3:
                return "outline-none min-h-[1.5em] text-lg font-medium text-gray-900";
            default:
                return "outline-none min-h-[1.5em] text-gray-900";
        }
    };

    // Render based on block type
    const renderContent = () => {
        switch (block.type) {
            case BLOCK_TYPES.TASK:
                return (
                    <div className="flex items-start gap-2">
                        <input
                            type="checkbox"
                            checked={block.properties?.checked || false}
                            onChange={handleCheckboxChange}
                            className="mt-1 w-4 h-4 rounded border-gray-300"
                        />
                        <div
                            ref={contentRef}
                            contentEditable
                            suppressContentEditableWarning
                            className={cn(
                                "flex-1 outline-none min-h-[1.5em]",
                                block.properties?.checked &&
                                    "line-through text-gray-400"
                            )}
                            onBlur={handleBlur}
                            onFocus={handleFocus}
                            onKeyDown={handleKeyDown}
                        />
                    </div>
                );

            case BLOCK_TYPES.QUOTE:
                return (
                    <div
                        className={cn(
                            "pl-4 border-l-4 border-gray-300",
                            "italic text-gray-600"
                        )}
                    >
                        <div
                            ref={contentRef}
                            contentEditable
                            suppressContentEditableWarning
                            className="outline-none min-h-[1.5em]"
                            onBlur={handleBlur}
                            onFocus={handleFocus}
                            onKeyDown={handleKeyDown}
                        />
                    </div>
                );

            default:
                // Paragraphs, headings, etc.
                return (
                    <div
                        ref={contentRef}
                        contentEditable
                        suppressContentEditableWarning
                        className={getContentClass()}
                        data-placeholder="Type something..."
                        onBlur={handleBlur}
                        onFocus={handleFocus}
                        onKeyDown={handleKeyDown}
                    />
                );
        }
    };

    return (
        <div
            className={cn(
                "relative py-1 px-2 -mx-2 rounded",
                isActive && "bg-blue-50/50"
            )}
            data-nested-block-id={blockId}
        >
            {renderContent()}
        </div>
    );
}
