import React from "react";
import { useTranslation } from "react-i18next";
import { buttonPrimary, buttonSecondary } from "../styles/commonStyles";

export interface CustomModalProps {
  title: string;
  message: string;
  isConfirm?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
}

const CustomModal: React.FC<CustomModalProps> = ({
  title,
  message,
  isConfirm = false,
  onConfirm,
  onCancel,
}) => {
  const { t } = useTranslation();
  if (!title) return null; // Não renderiza se não houver título (modal oculto)

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
        <h3 className={`text-xl font-bold mb-4`}>{title}</h3>
        <p className="text-gray-700 mb-6">{message}</p>
        <div className="flex justify-end space-x-4">
          <button onClick={onConfirm} className={"px-4 py-2 " + buttonPrimary}>
            {t("modal.ok")}
          </button>
          {isConfirm && (
            <button
              onClick={onCancel}
              className={"px-4 py-2 " + buttonSecondary}
            >
              {t("modal.cancel")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomModal;
