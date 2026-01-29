import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, Info, HelpCircle } from "lucide-react";
import { cn } from "../../utils/cn";

/**
 * Dialog - Custom dialog component to replace native browser dialogs
 * Supports alert, confirm, and prompt types
 */
export function Dialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    type = "confirm", // 'alert' | 'confirm' | 'prompt'
    confirmText = "Confirm",
    cancelText = "Cancel",
    danger = false,
    inputValue = "",
    onInputChange,
    inputPlaceholder = ""
}) {
    // Handle escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape" && isOpen) {
                onClose();
            }
            if (e.key === "Enter" && isOpen && type !== "prompt") {
                onConfirm?.();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose, onConfirm, type]);

    // Lock body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    const getIcon = () => {
        if (danger) return <AlertTriangle className="w-6 h-6 text-red-500" />;
        if (type === "alert") return <Info className="w-6 h-6 text-blue-500" />;
        return <HelpCircle className="w-6 h-6 text-gray-500" />;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="fixed inset-0 bg-black/50 z-50"
                        onClick={onClose}
                    />

                    {/* Dialog */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 30
                        }}
                        className={cn(
                            "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50",
                            "w-full max-w-md p-6",
                            "bg-white rounded-xl shadow-2xl",
                            "border border-gray-200"
                        )}
                    >
                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className={cn(
                                "absolute top-4 right-4",
                                "w-8 h-8 rounded-lg",
                                "flex items-center justify-center",
                                "text-gray-400 hover:text-gray-600",
                                "hover:bg-gray-100",
                                "transition-colors"
                            )}
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Content */}
                        <div className="flex gap-4">
                            {/* Icon */}
                            <div className="shrink-0 mt-0.5">{getIcon()}</div>

                            {/* Text */}
                            <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    {title}
                                </h3>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    {message}
                                </p>

                                {/* Input for prompt type */}
                                {type === "prompt" && (
                                    <input
                                        type="text"
                                        value={inputValue}
                                        onChange={(e) =>
                                            onInputChange?.(e.target.value)
                                        }
                                        placeholder={inputPlaceholder}
                                        autoFocus
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                onConfirm?.();
                                            }
                                        }}
                                        className={cn(
                                            "w-full mt-4 px-3 py-2",
                                            "border border-gray-300 rounded-lg",
                                            "text-gray-900 placeholder-gray-400",
                                            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        )}
                                    />
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 mt-6">
                            {type !== "alert" && (
                                <button
                                    onClick={onClose}
                                    className={cn(
                                        "px-4 py-2 rounded-lg",
                                        "text-gray-700 bg-gray-100",
                                        "hover:bg-gray-200",
                                        "font-medium text-sm",
                                        "transition-colors"
                                    )}
                                >
                                    {cancelText}
                                </button>
                            )}
                            <button
                                onClick={onConfirm}
                                autoFocus={type !== "prompt"}
                                className={cn(
                                    "px-4 py-2 rounded-lg",
                                    "font-medium text-sm",
                                    "transition-colors",
                                    danger
                                        ? "bg-red-500 hover:bg-red-600 text-white"
                                        : "bg-blue-500 hover:bg-blue-600 text-white"
                                )}
                            >
                                {confirmText}
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
