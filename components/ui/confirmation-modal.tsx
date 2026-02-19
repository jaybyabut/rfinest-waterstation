"use client";

import { AlertCircle  } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
}

export default function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
}: ConfirmationModalProps) {
    if (!isOpen) return null;

    return (
    
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1e3d58]/60 backdrop-blur-sm animate-in fade-in duration-200 px-4">
        
        <div className="bg-[#e8eef1] rounded-[40px] p-2 sm:p-3 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="bg-white rounded-[30px] p-6 text-center border border-gray-100">
            
            <div className="mx-auto w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
                <AlertCircle size={32} strokeWidth={2.5} />
            </div>

            <h2 className="text-2xl font-black text-[#1e3d58] mb-2 tracking-tight">
                {title}
            </h2>
            <p className="text-gray-500 font-medium mb-8 text-sm sm:text-base leading-snug">
                {message}
            </p>

            <div className="flex flex-col-reverse sm:flex-row gap-3">
                <Button
                onClick={onClose}
                variant="outline"
                className="flex-1 h-12 text-lg font-bold rounded-full border-2 border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-all"
                >
                {cancelText}
                </Button>
                <Button
                onClick={() => {
                    onConfirm();
                    onClose(); 
                }}
                className="flex-1 h-12 text-lg font-bold rounded-full bg-[#43b0f1] text-white hover:bg-[#1e3d58] transition-all shadow-md"
                >
                {confirmText}
                </Button>
            </div>

            </div>
        </div>
        </div>
    );
}
