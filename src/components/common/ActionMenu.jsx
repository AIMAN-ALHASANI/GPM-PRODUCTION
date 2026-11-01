import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';

const ActionMenu = ({ 
    isOpen, 
    onToggle, 
    onClose, 
    isActive, 
    onActivate, 
    onDeactivate, 
    onEdit 
}) => {
    const buttonRef = useRef(null);
    const menuRef = useRef(null);
    const [coords, setCoords] = useState({ top: 0, left: 0, openUpward: false });

    const updatePosition = () => {
        if (!buttonRef.current) return;
        const rect = buttonRef.current.getBoundingClientRect();
        const menuHeight = menuRef.current?.offsetHeight || 96;
        const menuWidth = 192; // 12rem / w-48

        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;

        // If space below is not enough for the menu and space above is greater, open upward
        const openUpward = spaceBelow < (menuHeight + 16) && spaceAbove > spaceBelow;

        let top = openUpward ? (rect.top - menuHeight - 6) : (rect.bottom + 6);

        // Ensure within viewport vertically
        if (top < 8) top = 8;
        if (top + menuHeight > window.innerHeight - 8) {
            top = Math.max(8, window.innerHeight - menuHeight - 8);
        }

        // Horizontal alignment: align with button, ensure within screen
        let left = rect.left;
        if (left + menuWidth > window.innerWidth - 8) {
            left = window.innerWidth - menuWidth - 8;
        }
        if (left < 8) {
            left = 8;
        }

        setCoords({ top, left, openUpward });
    };

    useLayoutEffect(() => {
        if (isOpen) {
            updatePosition();
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;

        const handleScrollOrResize = () => {
            updatePosition();
        };

        // Capture scroll on any scrollable parent (tables, window, etc.)
        window.addEventListener('scroll', handleScrollOrResize, true);
        window.addEventListener('resize', handleScrollOrResize);

        return () => {
            window.removeEventListener('scroll', handleScrollOrResize, true);
            window.removeEventListener('resize', handleScrollOrResize);
        };
    }, [isOpen]);

    return (
        <div className="relative inline-block text-left">
            <button 
                ref={buttonRef}
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    onToggle();
                }}
                className="text-slate-400 hover:text-primary p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all focus:outline-none"
                aria-haspopup="true"
                aria-expanded={isOpen}
            >
                <span className="material-symbols-outlined select-none">more_vert</span>
            </button>

            {isOpen && createPortal(
                <>
                    {/* Backdrop to close menu */}
                    <div 
                        className="fixed inset-0 z-[9998] bg-transparent" 
                        onClick={(e) => {
                            e.stopPropagation();
                            onClose();
                        }}
                    />

                    {/* Dropdown Menu */}
                    <div 
                        ref={menuRef}
                        style={{ 
                            position: 'fixed', 
                            top: `${coords.top}px`, 
                            left: `${coords.left}px`,
                            zIndex: 9999 
                        }}
                        className="w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden text-right"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button 
                            type="button"
                            onClick={() => {
                                onEdit();
                                onClose();
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        >
                            <span className="material-symbols-outlined text-[16px]">edit</span>
                            <span>تعديل الملف</span>
                        </button>
                        <button 
                            type="button"
                            onClick={() => {
                                if (isActive) {
                                    onDeactivate();
                                } else {
                                    onActivate();
                                }
                                onClose();
                            }}
                            className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm ${
                                isActive 
                                    ? 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30' 
                                    : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                            } transition-colors`}
                        >
                            <span className="material-symbols-outlined text-[16px]">
                                {isActive ? 'block' : 'check_circle'}
                            </span>
                            <span>{isActive ? 'تعطيل الحساب' : 'تفعيل الحساب'}</span>
                        </button>
                    </div>
                </>,
                document.body
            )}
        </div>
    );
};

export default ActionMenu;
