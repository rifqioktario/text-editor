import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronLeft,
    Plus,
    Search,
    FileText,
    MoreHorizontal,
    Trash2,
    Copy,
    PenLine
} from "lucide-react";
import { cn } from "../../utils/cn";

/**
 * Sidebar - Notion-inspired document navigation
 */
export function Sidebar({
    documents = [],
    activeDocumentId,
    isCollapsed = false,
    onToggleCollapse,
    onSelectDocument,
    onCreateDocument,
    onDeleteDocument,
    onDuplicateDocument,
    onRenameDocument,
    isSaving = false,
    lastSaved = null
}) {
    const [searchQuery, setSearchQuery] = useState("");
    const [menuOpenId, setMenuOpenId] = useState(null);

    // Filter documents
    const filteredDocuments = documents.filter((doc) =>
        doc.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest("[data-doc-menu]")) {
                setMenuOpenId(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Format last saved
    const formatLastSaved = useCallback(() => {
        if (!lastSaved) return null;
        const diff = Date.now() - new Date(lastSaved).getTime();
        if (diff < 60000) return "Just now";
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        return `${Math.floor(diff / 3600000)}h ago`;
    }, [lastSaved]);

    return (
        <motion.aside
            initial={false}
            animate={{ width: isCollapsed ? 0 : 240 }}
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
            className={cn(
                "h-full overflow-hidden",
                "bg-[#fbfbfa]",
                "border-r border-[#e8e8e6]",
                "flex flex-col"
            )}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-3 pt-3 pb-2">
                <span className="text-[11px] font-medium text-[#91918e] uppercase tracking-wider">
                    Documents
                </span>

                <div className="flex items-center gap-0.5">
                    {/* New Document */}
                    <button
                        onClick={onCreateDocument}
                        className={cn(
                            "w-6 h-6 rounded",
                            "flex items-center justify-center",
                            "text-[#91918e] hover:text-[#37352f]",
                            "hover:bg-[#ebebea]",
                            "transition-colors duration-100"
                        )}
                        title="New page"
                    >
                        <Plus className="w-4 h-4" strokeWidth={2} />
                    </button>

                    {/* Collapse */}
                    <button
                        onClick={onToggleCollapse}
                        className={cn(
                            "w-6 h-6 rounded",
                            "flex items-center justify-center",
                            "text-[#91918e] hover:text-[#37352f]",
                            "hover:bg-[#ebebea]",
                            "transition-colors duration-100"
                        )}
                    >
                        <motion.div
                            animate={{ rotate: isCollapsed ? 180 : 0 }}
                            transition={{ duration: 0.15 }}
                        >
                            <ChevronLeft className="w-4 h-4" strokeWidth={2} />
                        </motion.div>
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="px-2 pb-2">
                <div
                    className={cn(
                        "relative flex items-center",
                        "bg-[#f1f1ef] rounded",
                        "focus-within:bg-[#e8e8e6]",
                        "transition-colors duration-100"
                    )}
                >
                    <Search
                        className="absolute left-2 w-3.5 h-3.5 text-[#91918e]"
                        strokeWidth={2}
                    />
                    <input
                        type="text"
                        placeholder="Search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={cn(
                            "w-full pl-7 pr-2 py-1.5",
                            "bg-transparent",
                            "text-[13px] text-[#37352f] placeholder-[#91918e]",
                            "focus:outline-none"
                        )}
                    />
                </div>
            </div>

            {/* Document List */}
            <div className="flex-1 overflow-y-auto px-1 py-1">
                <AnimatePresence mode="popLayout">
                    {filteredDocuments.map((doc, index) => (
                        <motion.div
                            key={doc.id}
                            layout
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{
                                type: "spring",
                                stiffness: 500,
                                damping: 30,
                                delay: index * 0.02
                            }}
                        >
                            <DocumentItem
                                doc={doc}
                                isActive={doc.id === activeDocumentId}
                                isMenuOpen={menuOpenId === doc.id}
                                onSelect={() => onSelectDocument(doc.id)}
                                onMenuToggle={() =>
                                    setMenuOpenId(
                                        menuOpenId === doc.id ? null : doc.id
                                    )
                                }
                                onDelete={() => {
                                    onDeleteDocument(doc.id);
                                    setMenuOpenId(null);
                                }}
                                onDuplicate={() => {
                                    onDuplicateDocument(doc.id);
                                    setMenuOpenId(null);
                                }}
                                onRename={(newTitle) => {
                                    onRenameDocument(doc.id, newTitle);
                                    setMenuOpenId(null);
                                }}
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>

                {filteredDocuments.length === 0 && (
                    <div className="text-center py-8 text-[#91918e] text-[13px]">
                        {searchQuery ? "No results" : "No pages yet"}
                    </div>
                )}
            </div>

            {/* Footer - Save status */}
            <div className="px-3 py-2 border-t border-[#e8e8e6]">
                <div className="flex items-center gap-1.5 text-[11px] text-[#91918e]">
                    {isSaving ? (
                        <>
                            <motion.div
                                animate={{ opacity: [0.4, 1, 0.4] }}
                                transition={{
                                    repeat: Infinity,
                                    duration: 1.2,
                                    ease: "easeInOut"
                                }}
                                className="w-1.5 h-1.5 bg-[#91918e] rounded-full"
                            />
                            <span>Saving...</span>
                        </>
                    ) : lastSaved ? (
                        <>
                            <div className="w-1.5 h-1.5 bg-[#2ecc71] rounded-full" />
                            <span>Saved {formatLastSaved()}</span>
                        </>
                    ) : null}
                </div>
            </div>
        </motion.aside>
    );
}

/**
 * DocumentItem - Notion-style document row with inline rename
 */
function DocumentItem({
    doc,
    isActive,
    isMenuOpen,
    onSelect,
    onMenuToggle,
    onDelete,
    onDuplicate,
    onRename
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(doc.title || "");
    const inputRef = useCallback((node) => {
        if (node) {
            node.focus();
            node.select();
        }
    }, []);

    const handleDoubleClick = (e) => {
        e.stopPropagation();
        setEditValue(doc.title || "");
        setIsEditing(true);
    };

    const handleSave = () => {
        const newTitle = editValue.trim() || "Untitled";
        if (newTitle !== doc.title) {
            onRename(newTitle);
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSave();
        } else if (e.key === "Escape") {
            setEditValue(doc.title || "");
            setIsEditing(false);
        }
    };

    // Handle right-click context menu
    const handleContextMenu = (e) => {
        e.preventDefault();
        e.stopPropagation();
        onMenuToggle();
    };

    return (
        <div
            onClick={!isEditing ? onSelect : undefined}
            onContextMenu={handleContextMenu}
            className={cn(
                "group relative",
                "flex items-center gap-2",
                "px-2 py-1 mx-1 rounded",
                "cursor-pointer select-none",
                "transition-colors duration-75",
                isActive ? "bg-[#ebebea]" : "hover:bg-[#f1f1ef]"
            )}
        >
            {/* Document Icon */}
            <FileText
                className={cn(
                    "w-4 h-4 shrink-0",
                    isActive ? "text-[#37352f]" : "text-[#91918e]"
                )}
                strokeWidth={1.5}
            />

            {/* Title - editable on double-click */}
            {isEditing ? (
                <input
                    ref={inputRef}
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={handleSave}
                    onKeyDown={handleKeyDown}
                    onClick={(e) => e.stopPropagation()}
                    className={cn(
                        "flex-1 text-[14px] min-w-0",
                        "bg-white border border-[#2383e2] rounded px-1",
                        "text-[#37352f] font-medium",
                        "focus:outline-none"
                    )}
                />
            ) : (
                <span
                    onDoubleClick={handleDoubleClick}
                    className={cn(
                        "flex-1 text-[14px] truncate",
                        isActive
                            ? "text-[#37352f] font-medium"
                            : "text-[#37352f]"
                    )}
                >
                    {doc.title || "Untitled"}
                </span>
            )}

            {/* Context Menu Button */}
            <div data-doc-menu className="relative">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onMenuToggle();
                    }}
                    className={cn(
                        "w-5 h-5 rounded",
                        "flex items-center justify-center",
                        "opacity-0 group-hover:opacity-100",
                        "transition-opacity duration-75",
                        "hover:bg-[#dfdeda]",
                        isMenuOpen && "opacity-100 bg-[#dfdeda]"
                    )}
                >
                    <MoreHorizontal
                        className="w-4 h-4 text-[#91918e]"
                        strokeWidth={2}
                    />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -4 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -4 }}
                            transition={{ duration: 0.1 }}
                            className={cn(
                                "absolute right-0 top-full mt-1 z-50",
                                "w-44 py-1",
                                "bg-white",
                                "rounded-lg shadow-lg",
                                "border border-[#e8e8e6]"
                            )}
                        >
                            <MenuItem
                                icon={PenLine}
                                label="Rename"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRename();
                                }}
                            />
                            <MenuItem
                                icon={Copy}
                                label="Duplicate"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDuplicate();
                                }}
                            />
                            <div className="my-1 border-t border-[#e8e8e6]" />
                            <MenuItem
                                icon={Trash2}
                                label="Delete"
                                danger
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete();
                                }}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

/**
 * MenuItem - Notion-style dropdown menu item
 */
function MenuItem({ icon: Icon, label, danger = false, onClick }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "w-full flex items-center gap-2 px-3 py-1.5",
                "text-[13px] text-left",
                "transition-colors duration-75",
                danger
                    ? "text-[#eb5757] hover:bg-[#eb5757]/10"
                    : "text-[#37352f] hover:bg-[#f1f1ef]"
            )}
        >
            <Icon className="w-4 h-4" strokeWidth={1.5} />
            {label}
        </button>
    );
}
