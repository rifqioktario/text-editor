import { useRef, useEffect, useCallback } from "react";
import { cn } from "../../../utils/cn";

/**
 * ParagraphBlock - Basic text block with contenteditable
 *
 * Uses uncontrolled contentEditable to avoid cursor jumping issues.
 * Content is synced via onInput, but we don't re-render the DOM content.
 */
export function ParagraphBlock({
    id,
    content,
    isActive,
    showPlaceholder,
    onContentChange,
    onKeyDown,
    onFocus
}) {
    const contentRef = useRef(null);
    const isInitialMount = useRef(true);

    // Set initial content only on mount
    useEffect(() => {
        if (isInitialMount.current && contentRef.current) {
            contentRef.current.innerHTML = content;
            isInitialMount.current = false;
        }
    }, [content]);

    // Focus when block becomes active
    useEffect(() => {
        if (isActive && contentRef.current) {
            contentRef.current.focus();
            // Move cursor to end
            const range = document.createRange();
            const sel = window.getSelection();
            range.selectNodeContents(contentRef.current);
            range.collapse(false); // false = collapse to end
            sel?.removeAllRanges();
            sel?.addRange(range);
        }
    }, [isActive]);

    // Convert inline Markdown patterns to HTML
    const convertInlineMarkdown = useCallback((html) => {
        let converted = html;
        let changed = false;

        // **bold** -> <strong>bold</strong>
        const boldPattern = /\*\*([^*]+)\*\*/g;
        if (boldPattern.test(converted)) {
            converted = converted.replace(boldPattern, "<strong>$1</strong>");
            changed = true;
        }

        // *italic* -> <em>italic</em> (but not if part of **)
        const italicPattern = /(?<!\*)\*([^*]+)\*(?!\*)/g;
        if (italicPattern.test(converted)) {
            converted = converted.replace(italicPattern, "<em>$1</em>");
            changed = true;
        }

        // ~~strikethrough~~ -> <s>strikethrough</s>
        const strikePattern = /~~([^~]+)~~/g;
        if (strikePattern.test(converted)) {
            converted = converted.replace(strikePattern, "<s>$1</s>");
            changed = true;
        }

        // `code` -> <code>code</code>
        const codePattern = /`([^`]+)`/g;
        if (codePattern.test(converted)) {
            converted = converted.replace(
                codePattern,
                '<code class="bg-gray-100 px-1 rounded text-sm font-mono">$1</code>'
            );
            changed = true;
        }

        return { converted, changed };
    }, []);

    // Handle input changes - sync to store without re-rendering
    const handleInput = useCallback(
        (e) => {
            const el = e.currentTarget;
            let newContent = el.innerHTML || "";

            // Try to convert inline Markdown
            const { converted, changed } = convertInlineMarkdown(newContent);

            if (changed) {
                // Update content with converted HTML
                const selection = window.getSelection();
                el.innerHTML = converted;
                newContent = converted;

                // Move cursor to end of converted element
                try {
                    const newRange = document.createRange();
                    newRange.selectNodeContents(el);
                    newRange.collapse(false);
                    selection?.removeAllRanges();
                    selection?.addRange(newRange);
                } catch {
                    // Ignore cursor positioning errors
                }
            }

            onContentChange(id, newContent);
        },
        [id, onContentChange, convertInlineMarkdown]
    );

    // Handle key events
    const handleKeyDown = useCallback(
        (e) => {
            onKeyDown(e, id, contentRef.current);
        },
        [id, onKeyDown]
    );

    // Handle focus
    const handleFocus = useCallback(() => {
        onFocus(id);
    }, [id, onFocus]);

    return (
        <div
            ref={contentRef}
            contentEditable
            suppressContentEditableWarning
            className={cn(
                "outline-none",
                "min-h-[1.5em]",
                "py-1 px-0",
                "text-base leading-relaxed",
                "text-gray-900",
                showPlaceholder &&
                    "empty:before:content-[attr(data-placeholder)]",
                showPlaceholder && "empty:before:text-gray-400",
                showPlaceholder && "empty:before:pointer-events-none",
                isActive && "bg-blue-50/30"
            )}
            data-placeholder={showPlaceholder ? "Type '/' for commands..." : ""}
            data-block-id={id}
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
        />
    );
}
