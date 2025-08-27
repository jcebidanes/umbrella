import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  buttonPrimary,
  buttonDanger,
  buttonSuccess,
  inputBase,
  inputSmall,
  containerBase,
} from "../styles/commonStyles";
import { RpgItem } from "../types/rpgTypes";

interface CreateListScreenProps {
  onSaveNewList: (name: string, items: RpgItem[]) => Promise<void>;
  onCancel: () => void;
}

const CreateListScreen: React.FC<CreateListScreenProps> = ({
  onSaveNewList,
  onCancel,
}) => {
  const [newListName, setNewListName] = useState<string>("");
  const [items, setItems] = useState<RpgItem[]>([
    { nome: "", peso: undefined },
  ]);

  const handleItemChange = (
    index: number,
    field: "nome" | "peso",
    value: string
  ) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]:
                field === "peso"
                  ? value === ""
                    ? undefined
                    : Number(value)
                  : value,
            }
          : item
      )
    );
  };

  const handleAddItem = () => {
    setItems((prev) => [...prev, { nome: "", peso: undefined }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    await onSaveNewList(newListName, items);
    setNewListName("");
    setItems([{ nome: "", peso: undefined }]);
  };

  const { t } = useTranslation();
  return (
    <div id="create-list-screen" className={containerBase}>
      <p className="text-gray-600 mb-4 text-center text-base sm:text-lg">
        {t("createList.title")}
      </p>
      <input
        type="text"
        id="newListNameInput"
        className={`${inputBase} mb-4`}
        placeholder={t("createList.namePlaceholder")}
        value={newListName}
        onChange={(e) => setNewListName(e.target.value)}
      />
      <div className="w-full mb-6 flex flex-col gap-2">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center mb-2 gap-2">
            <input
              type="text"
              className={
                "flex-grow p-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder-gray-400 transition-all duration-200 text-base sm:text-lg"
              }
              placeholder={t("createList.itemPlaceholder", { index: idx + 1 })}
              value={item.nome}
              onChange={(e) => handleItemChange(idx, "nome", e.target.value)}
            />
            <input
              type="number"
              min="1"
              className="w-20 p-3 border-2 border-gray-300 rounded-xl text-base sm:text-lg"
              placeholder={t("createList.weightPlaceholder")}
              value={item.peso === undefined ? "" : item.peso}
              onChange={(e) => handleItemChange(idx, "peso", e.target.value)}
            />
            <button
              type="button"
              className="ml-2 flex items-center justify-center bg-red-600 text-white rounded-xl p-2 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75 duration-200"
              style={{ width: 40, height: 40 }}
              onClick={() => handleRemoveItem(idx)}
              disabled={items.length === 1}
              aria-label={t("createList.cancel")}
            >
              <span className="sr-only">{t("createList.cancel")}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <title>{t("createList.cancel")}</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        ))}
        <button
          type="button"
          className={`mt-2 ${buttonPrimary}`}
          onClick={handleAddItem}
        >
          {t("createList.addItem")}
        </button>
      </div>
      <button onClick={handleSave} className={`${buttonSuccess} mb-4`}>
        {t("createList.save")}
      </button>
      <button onClick={onCancel} className={buttonDanger}>
        {t("createList.cancel")}
      </button>
    </div>
  );
};

export default CreateListScreen;
