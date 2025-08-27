import React, { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  buttonPrimary,
  buttonSecondary,
  containerBase,
} from "../styles/commonStyles";
import { RpgLists, RpgItem } from "../types/rpgTypes";

interface RandomizerScreenProps {
  currentListName: string;
  allRpgLists: RpgLists;
  onEditList: () => void;
  onBackToLists: () => void;
  showModal: (
    title: string,
    message: string,
    isConfirm?: boolean
  ) => Promise<boolean>;
}

function getWeightedRandomItem(items: RpgItem[]): RpgItem | null {
  if (!items || items.length === 0) return null;
  const weights = items.map((item) =>
    item.peso !== undefined ? item.peso : 1
  );
  const totalWeight = weights.reduce((acc, w) => acc + w, 0);
  let rnd = Math.random() * totalWeight;
  for (let i = 0; i < items.length; i++) {
    if (rnd < weights[i]) return items[i];
    rnd -= weights[i];
  }
  return items[items.length - 1];
}

const RandomizerScreen: React.FC<RandomizerScreenProps> = ({
  currentListName,
  allRpgLists,
  onEditList,
  onBackToLists,
  showModal,
}) => {
  const { t } = useTranslation();
  const [resultText, setResultText] = useState<string>(
    t("randomizer.instruction", { list: currentListName })
  );
  const [resultDisplayClass, setResultDisplayClass] = useState<string>(
    "mt-4 p-6 bg-gradient-to-r from-blue-400 to-indigo-500 text-white text-center rounded-xl shadow-lg transform scale-100 opacity-100 flex items-center justify-center min-h-[80px] w-full"
  );

  const randomizeItem = useCallback(async () => {
    let currentPath: string[] = [currentListName];
    let foundFinalItem = false;
    let finalItem: RpgItem | null = null;
    let maxDepth = 10;
    let currentItems: RpgItem[] = allRpgLists[currentListName] || [];
    while (!foundFinalItem && maxDepth > 0) {
      if (!currentItems || currentItems.length === 0) {
        await showModal(
          "Erro",
          `A lista "${currentListName}" está vazia ou não existe.`
        );
        setResultText("Erro: Sorteio falhou.");
        setResultDisplayClass(
          "mt-4 p-6 bg-red-400 text-white text-center rounded-xl shadow-lg transform scale-100 opacity-100 flex items-center justify-center min-h-[80px] w-full"
        );
        return;
      }
      const selectedItem = getWeightedRandomItem(currentItems);
      if (!selectedItem) {
        await showModal("Erro", "Não foi possível sortear um item.");
        setResultText("Erro: Sorteio falhou.");
        setResultDisplayClass(
          "mt-4 p-6 bg-red-400 text-white text-center rounded-xl shadow-lg transform scale-100 opacity-100 flex items-center justify-center min-h-[80px] w-full"
        );
        return;
      }
      if (selectedItem.nome.startsWith("LIST_REF:")) {
        const nextListName: string = selectedItem.nome
          .substring("LIST_REF:".length)
          .trim();
        if (allRpgLists[nextListName]) {
          if (currentPath.includes(nextListName)) {
            setResultText(`Erro: Loop de referência em "${nextListName}"`);
            setResultDisplayClass(
              "mt-4 p-6 bg-red-400 text-white text-center rounded-xl shadow-lg transform scale-100 opacity-100 flex items-center justify-center min-h-[80px] w-full"
            );
            return;
          }
          currentPath.push(nextListName);
          currentItems = allRpgLists[nextListName] || [];
          maxDepth--;
        } else {
          await showModal(
            "Erro",
            `Lista aninhada "${nextListName}" não encontrada. Não é possível sortear.`
          );
          setResultText(
            `Erro: Lista aninhada "${nextListName}" não encontrada.`
          );
          setResultDisplayClass(
            "mt-4 p-6 bg-red-400 text-white text-center rounded-xl shadow-lg transform scale-100 opacity-100 flex items-center justify-center min-h-[80px] w-full"
          );
          return;
        }
      } else {
        finalItem = selectedItem;
        foundFinalItem = true;
      }
    }
    if (!foundFinalItem) {
      await showModal(
        "Erro",
        "Profundidade máxima de referência atingida. Possível loop ou lista muito complexa."
      );
      setResultText("Erro: Profundidade máxima de referência atingida.");
      setResultDisplayClass(
        "mt-4 p-6 bg-red-400 text-white text-center rounded-xl shadow-lg transform scale-100 opacity-100 flex items-center justify-center min-h-[80px] w-full"
      );
      return;
    }
    setResultText(`${currentPath.join(" -> ")} -> ${finalItem?.nome}`);
    setResultDisplayClass(
      "mt-4 p-6 bg-gradient-to-r from-green-400 to-emerald-500 text-white text-center rounded-xl shadow-lg transform scale-100 opacity-100 flex items-center justify-center min-h-[80px] w-full"
    );
  }, [currentListName, allRpgLists, showModal]);

  return (
    <div id="randomizer-screen" className={containerBase}>
      <h2
        id="currentListNameTitle"
        className="sm:text-2xl text-xl font-bold text-gray-700 mb-4 text-center"
      >
        {currentListName}
      </h2>
      <p className="text-gray-600 mb-4 text-center text-base sm:text-lg">
        {t("randomizer.instruction")}
      </p>
      <button
        onClick={randomizeItem}
        className={
          buttonPrimary +
          " mb-4 text-base sm:text-lg bg-purple-600 hover:bg-purple-700 focus:ring-purple-500"
        }
      >
        {t("randomizer.draw")}
      </button>
      <div
        id="resultDisplay"
        className={resultDisplayClass + " text-center overflow-x-auto"}
        role={resultText.startsWith("Erro") ? "alert" : undefined}
      >
        <p className="text-2xl sm:text-3xl font-extrabold" id="resultText">
          {resultText}
        </p>
      </div>
      <button
        onClick={onEditList}
        className={buttonSecondary + " mt-6 text-base sm:text-lg"}
        aria-label={t("randomizer.edit")}
      >
        <span className="sr-only">{t("randomizer.edit")}</span>
        {t("randomizer.edit")}
      </button>
      <button
        onClick={onBackToLists}
        className={
          buttonSecondary +
          " mt-4 text-base sm:text-lg bg-gray-400 hover:bg-gray-500 focus:ring-gray-400"
        }
        aria-label={t("randomizer.back")}
      >
        <span className="sr-only">{t("randomizer.back")}</span>
        {t("randomizer.back")}
      </button>
    </div>
  );
};

export default RandomizerScreen;
