import { AlertTriangle, Info, X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type?: "danger" | "warning" | "info";
  confirmLabel?: string;
  cancelLabel?: string;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = "warning",
  confirmLabel = "Xác nhận",
  cancelLabel = "Hủy"
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const colorConfig = {
    danger: {
      bg: "bg-red-50",
      icon: "text-red-600",
      btn: "bg-red-600 hover:bg-red-700"
    },
    warning: {
      bg: "bg-yellow-50",
      icon: "text-yellow-600",
      btn: "bg-yellow-600 hover:bg-yellow-700"
    },
    info: {
      bg: "bg-blue-50",
      icon: "text-blue-600",
      btn: "bg-blue-600 hover:bg-blue-700"
    }
  };

  const config = colorConfig[type];

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div
              className={`p-3 rounded-full ${config.bg} ${config.icon} shrink-0`}
            >
              {type === "info" ? (
                <Info size={24} />
              ) : (
                <AlertTriangle size={24} />
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{message}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:bg-gray-200 hover:rounded-full transition-colors p-1 cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-3 flex flex-col-reverse sm:flex-row justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors shadow-sm cursor-pointer ${config.btn}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
