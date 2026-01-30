import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDrag } from "@use-gesture/react";
import {
    MoreHorizontal,
    Palette,
    Highlighter,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Copy,
    Trash2,
    Minus,
    ChevronRight,
    Check
} from "lucide-react";
import { cn } from "../../utils/cn";
import { useMobile } from "../../hooks/useMobile";

/**
 * Preset color palette
 */
const COLOR_PALETTE = [
    { name: "Default", value: null },
    { name: "Black", value: "#1a1a1a" },
    { name: "Gray", value: "#6b7280" },
    { name: "Red", value: "#ef4444" },
    { name: "Orange", value: "#f97316" },
    { name: "Yellow", value: "#eab308" },
    { name: "Green", value: "#22c55e" },
    { name: "Blue", value: "#3b82f6" },
    { name: "Purple", value: "#8b5cf6" },
    { name: "Pink", value: "#ec4899" }
];

/**
 * Background color palette (lighter shades)
 */
const BACKGROUND_PALETTE = [
    { name: "Clear", value: null },
    { name: "Gray", value: "#f3f4f6" },
    { name: "Red", value: "#fee2e2" },
    { name: "Orange", value: "#ffedd5" },
    { name: "Yellow", value: "#fef08a" },
    { name: "Green", value: "#dcfce7" },
    { name: "Blue", value: "#dbeafe" },
    { name: "Purple", value: "#ede9fe" },
    { name: "Pink", value: "#fce7f3" }
];

/**
 * MenuDivider - Visual separator between menu sections
 */
function MenuDivider() {
    return <div className="my-1 border-t border-gray-200" />;
}

/**
 * MenuItem - Individual menu item with icon and optional shortcut
 */
function MenuItem({
    icon: Icon,
    label,
    shortcut,
    onClick,
    disabled = false,
    danger = false,
    hasSubmenu = false,
    isMobile = false,
    compact = false
}) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={cn(
                "flex items-center gap-2",
                "transition-colors duration-75",
                disabled && "opacity-40 cursor-not-allowed",
                !disabled &&
                    !danger &&
                    "text-gray-700 hover:bg-gray-100 active:bg-gray-200",
                danger &&
                    !disabled &&
                    "text-red-500 hover:bg-red-50 active:bg-red-100",
                compact
                    ? ["p-3 rounded-xl", "justify-center"]
                    : isMobile
                      ? ["w-full px-4 py-3", "text-base text-left"]
                      : ["w-full px-3 py-1.5", "text-[13px] text-left"]
            )}
        >
            <Icon
                className={cn(
                    "shrink-0",
                    isMobile || compact ? "w-5 h-5" : "w-4 h-4"
                )}
                strokeWidth={1.5}
            />
            {label && <span className="flex-1">{label}</span>}
            {shortcut && (
                <span className="text-[11px] text-gray-400">{shortcut}</span>
            )}
            {hasSubmenu && (
                <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            )}
        </button>
    );
}

/**
 * ColorPicker - Submenu for selecting colors
 */
function ColorPicker({ colors, selectedColor, onSelect, onClose }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.15 }}
            className={cn(
                "absolute left-full top-0 ml-1",
                "w-48 p-2",
                "bg-white",
                "rounded-lg shadow-lg",
                "border border-gray-200"
            )}
        >
            <div className="grid grid-cols-5 gap-1.5">
                {colors.map((color) => (
                    <button
                        key={color.name}
                        onClick={() => {
                            onSelect(color.value);
                            onClose();
                        }}
                        title={color.name}
                        className={cn(
                            "w-7 h-7 rounded-md",
                            "flex items-center justify-center",
                            "transition-all duration-100",
                            "hover:scale-110 hover:shadow-md",
                            "border",
                            color.value === null
                                ? "border-gray-300 bg-white"
                                : "border-transparent"
                        )}
                        style={{
                            backgroundColor: color.value || "transparent"
                        }}
                    >
                        {selectedColor === color.value && (
                            <Check
                                className={cn(
                                    "w-4 h-4",
                                    color.value === null ||
                                        color.value === "#eab308" ||
                                        color.value === "#fef08a"
                                        ? "text-gray-700"
                                        : "text-white"
                                )}
                                strokeWidth={2.5}
                            />
                        )}
                        {color.value === null && selectedColor !== null && (
                            <span className="text-[10px] text-gray-400">✕</span>
                        )}
                    </button>
                ))}
            </div>
        </motion.div>
    );
}

/**
 * ToolbarMoreMenu - Dropdown menu for additional toolbar options
 */
export function ToolbarMoreMenu({
    hasSelection = false,
    activeBlockId,
    onTextColor,
    onBackgroundColor,
    onAlign,
    onDuplicateBlock,
    onDeleteBlock,
    onInsertDivider
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [activeSubmenu, setActiveSubmenu] = useState(null);
    const [currentTextColor, setCurrentTextColor] = useState(null);
    const [currentBgColor, setCurrentBgColor] = useState(null);
    const menuRef = useRef(null);
    const { isMobile } = useMobile();

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setIsOpen(false);
                setActiveSubmenu(null);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            return () =>
                document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [isOpen]);

    // Close menu on escape
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                setIsOpen(false);
                setActiveSubmenu(null);
            }
        };

        if (isOpen) {
            document.addEventListener("keydown", handleKeyDown);
            return () => document.removeEventListener("keydown", handleKeyDown);
        }
    }, [isOpen]);

    const handleTextColorSelect = useCallback(
        (color) => {
            setCurrentTextColor(color);
            onTextColor?.(color);
        },
        [onTextColor]
    );

    const handleBgColorSelect = useCallback(
        (color) => {
            setCurrentBgColor(color);
            onBackgroundColor?.(color);
        },
        [onBackgroundColor]
    );

    const handleMenuItemClick = useCallback((action) => {
        action?.();
        setIsOpen(false);
        setActiveSubmenu(null);
    }, []);

    // Swipe down to dismiss on mobile
    const bindDrag = useDrag(
        ({ movement: [, my], velocity: [, vy], direction: [, dy], cancel }) => {
            if (isMobile && dy > 0 && (my > 150 || vy > 0.5)) {
                setIsOpen(false);
                setActiveSubmenu(null);
                cancel();
            }
        },
        {
            axis: "y",
            filterTaps: true
        }
    );

    // Menu content (shared between desktop and mobile)
    const menuContent = (
        <>
            {/* Text Formatting Section */}
            <div
                className="relative"
                onMouseEnter={() => !isMobile && setActiveSubmenu("textColor")}
                onMouseLeave={() => !isMobile && setActiveSubmenu(null)}
                onClick={() =>
                    isMobile &&
                    setActiveSubmenu(
                        activeSubmenu === "textColor" ? null : "textColor"
                    )
                }
            >
                <MenuItem
                    icon={Palette}
                    label="Text color"
                    hasSubmenu
                    disabled={!hasSelection}
                    onClick={() => {}}
                    isMobile={isMobile}
                />
                <AnimatePresence>
                    {activeSubmenu === "textColor" && hasSelection && (
                        <ColorPicker
                            colors={COLOR_PALETTE}
                            selectedColor={currentTextColor}
                            onSelect={handleTextColorSelect}
                            onClose={() => setActiveSubmenu(null)}
                            isMobile={isMobile}
                        />
                    )}
                </AnimatePresence>
            </div>

            <div
                className="relative"
                onMouseEnter={() => !isMobile && setActiveSubmenu("bgColor")}
                onMouseLeave={() => !isMobile && setActiveSubmenu(null)}
                onClick={() =>
                    isMobile &&
                    setActiveSubmenu(
                        activeSubmenu === "bgColor" ? null : "bgColor"
                    )
                }
            >
                <MenuItem
                    icon={Highlighter}
                    label="Background"
                    hasSubmenu
                    disabled={!hasSelection}
                    onClick={() => {}}
                    isMobile={isMobile}
                />
                <AnimatePresence>
                    {activeSubmenu === "bgColor" && hasSelection && (
                        <ColorPicker
                            colors={BACKGROUND_PALETTE}
                            selectedColor={currentBgColor}
                            onSelect={handleBgColorSelect}
                            onClose={() => setActiveSubmenu(null)}
                            isMobile={isMobile}
                        />
                    )}
                </AnimatePresence>
            </div>

            <MenuDivider />

            {/* Alignment Section */}
            <div className={isMobile ? "flex justify-around py-2" : ""}>
                <MenuItem
                    icon={AlignLeft}
                    label={isMobile ? "" : "Align left"}
                    disabled={!hasSelection}
                    onClick={() => handleMenuItemClick(() => onAlign?.("Left"))}
                    isMobile={isMobile}
                    compact={isMobile}
                />
                <MenuItem
                    icon={AlignCenter}
                    label={isMobile ? "" : "Center"}
                    disabled={!hasSelection}
                    onClick={() =>
                        handleMenuItemClick(() => onAlign?.("Center"))
                    }
                    isMobile={isMobile}
                    compact={isMobile}
                />
                <MenuItem
                    icon={AlignRight}
                    label={isMobile ? "" : "Align right"}
                    disabled={!hasSelection}
                    onClick={() =>
                        handleMenuItemClick(() => onAlign?.("Right"))
                    }
                    isMobile={isMobile}
                    compact={isMobile}
                />
            </div>

            <MenuDivider />

            {/* Block Operations */}
            <MenuItem
                icon={Copy}
                label="Duplicate block"
                shortcut={isMobile ? "" : "⌘D"}
                disabled={!activeBlockId}
                onClick={() => handleMenuItemClick(onDuplicateBlock)}
                isMobile={isMobile}
            />
            <MenuItem
                icon={Trash2}
                label="Delete block"
                danger
                disabled={!activeBlockId}
                onClick={() => handleMenuItemClick(onDeleteBlock)}
                isMobile={isMobile}
            />

            <MenuDivider />

            {/* Insert Section */}
            <MenuItem
                icon={Minus}
                label="Horizontal divider"
                onClick={() => handleMenuItemClick(onInsertDivider)}
                isMobile={isMobile}
            />
        </>
    );

    return (
        <div ref={menuRef} className="relative">
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "rounded-lg transition-all duration-150",
                    "flex items-center justify-center",
                    "cursor-pointer active:scale-95",
                    isMobile
                        ? ["w-11 h-11", "hover:bg-gray-100 active:bg-gray-200"]
                        : ["p-2", "hover:bg-gray-100 active:bg-gray-200"],
                    isOpen && "bg-gray-200"
                )}
                title="More options"
            >
                <MoreHorizontal
                    className={cn(
                        "text-gray-600",
                        isMobile ? "w-5 h-5" : "w-[18px] h-[18px]"
                    )}
                />
            </button>

            {/* Desktop: Dropdown Menu */}
            {!isMobile && (
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 4 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 4 }}
                            transition={{ duration: 0.1 }}
                            className={cn(
                                "absolute bottom-full right-0 mb-2",
                                "w-52 py-1",
                                "bg-white",
                                "rounded-xl shadow-lg",
                                "border border-gray-200"
                            )}
                        >
                            {menuContent}
                        </motion.div>
                    )}
                </AnimatePresence>
            )}

            {/* Mobile: Bottom Sheet */}
            {isMobile && (
                <AnimatePresence>
                    {isOpen && (
                        <>
                            {/* Backdrop */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                onClick={() => {
                                    setIsOpen(false);
                                    setActiveSubmenu(null);
                                }}
                                className="fixed inset-0 z-[60] bg-black/50"
                            />

                            {/* Bottom Sheet */}
                            <motion.div
                                {...bindDrag()}
                                initial={{ y: "100%" }}
                                animate={{ y: 0 }}
                                exit={{ y: "100%" }}
                                transition={{
                                    type: "spring",
                                    stiffness: 400,
                                    damping: 35
                                }}
                                className={cn(
                                    "fixed inset-x-0 bottom-0 z-[70]",
                                    "bg-white rounded-t-2xl",
                                    "shadow-2xl",
                                    "touch-pan-y"
                                )}
                                style={{
                                    paddingBottom:
                                        "calc(env(safe-area-inset-bottom, 0px) + 16px)"
                                }}
                            >
                                {/* Drag Handle */}
                                <div className="flex justify-center pt-3 pb-2">
                                    <div className="w-10 h-1 rounded-full bg-gray-300" />
                                </div>

                                {/* Sheet Content */}
                                <div className="px-2 py-1 max-h-[60vh] overflow-y-auto">
                                    {menuContent}
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            )}
        </div>
    );
}
