import React, { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  buttonPrimary,
  buttonSecondary,
  containerBase,
  resultDisplayDefault,
  resultDisplayError,
  resultDisplaySuccess,
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
  darkMode: boolean;
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
  darkMode,
}) => {
  const { t } = useTranslation();
  const [resultText, setResultText] = useState<string>(
    t("randomizer.instruction", { list: currentListName })
  );
  const [resultDisplayClass, setResultDisplayClass] =
    useState<string>(resultDisplayDefault);

  const randomizeItem = useCallback(async () => {
    let currentPath: string[] = [currentListName];
    let foundFinalItem = false;
    let finalItem: RpgItem | null = null;
    let maxDepth = 10;
    let currentItems: RpgItem[] = allRpgLists[currentListName] || [];
    while (!foundFinalItem && maxDepth > 0) {
      if (!currentItems || currentItems.length === 0) {
        await showModal(
          t("randomizer.errorTitle"),
          t("randomizer.emptyListError", { list: currentListName })
        );
        setResultText(t("randomizer.drawFailed"));
        setResultDisplayClass(resultDisplayError);
        return;
      }
      const selectedItem = getWeightedRandomItem(currentItems);
      if (!selectedItem) {
        await showModal(t("randomizer.errorTitle"), t("randomizer.drawFailed"));
        setResultText(t("randomizer.drawFailed"));
        setResultDisplayClass(resultDisplayError);
        return;
      }
      if (selectedItem.nome.startsWith("LIST_REF:")) {
        const nextListName: string = selectedItem.nome
          .substring("LIST_REF:".length)
          .trim();
        if (allRpgLists[nextListName]) {
          if (currentPath.includes(nextListName)) {
            setResultText(t("randomizer.loopError", { list: nextListName }));
            setResultDisplayClass(resultDisplayError);
            return;
          }
          currentPath.push(nextListName);
          currentItems = allRpgLists[nextListName] || [];
          maxDepth--;
        } else {
          await showModal(
            t("randomizer.errorTitle"),
            t("randomizer.nestedListNotFoundError", { list: nextListName })
          );
          setResultText(
            t("randomizer.nestedListNotFoundErrorResult", {
              list: nextListName,
            })
          );
          setResultDisplayClass(resultDisplayError);
          return;
        }
      } else {
        finalItem = selectedItem;
        foundFinalItem = true;
      }
    }
    if (!foundFinalItem) {
      await showModal(
        t("randomizer.errorTitle"),
        t("randomizer.maxDepthError")
      );
      setResultText(t("randomizer.maxDepthErrorResult"));
      setResultDisplayClass(resultDisplayError);
      return;
    }
    const result = t("randomizer.successResult", {
      path: currentPath.join(" -> "),
      item: finalItem?.nome,
      defaultValue: `${currentPath.join(" -> ")} -> ${finalItem?.nome}`,
    });
    setResultText(result);
    setResultDisplayClass(resultDisplaySuccess);
  }, [currentListName, allRpgLists, showModal]);

  return (
    <div id="randomizer-screen" className={containerBase}>
      <h2
        id="currentListNameTitle"
        className={`sm:text-2xl text-xl font-bold mb-4 text-center ${darkMode ? 'text-yellow-100' : 'text-gray-700'}`}
      >
        {currentListName}
      </h2>
      <p className={`mb-4 text-center text-base sm:text-lg ${darkMode ? 'text-yellow-100' : 'text-gray-600'}`}>
        {t("randomizer.instruction")}
      </p>
      <button
        onClick={randomizeItem}
        className={buttonPrimary + " mb-4 text-base sm:text-lg"}
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
        className={buttonSecondary + " mt-4 text-base sm:text-lg"}
        aria-label={t("randomizer.back")}
      >
        <span className="sr-only">{t("randomizer.back")}</span>
        {t("randomizer.back")}
      </button>
    </div>
  );
};

export default RandomizerScreen;
