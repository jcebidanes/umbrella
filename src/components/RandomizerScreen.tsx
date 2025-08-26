import React, { useState, useCallback } from "react";

interface RandomizerScreenProps {
  currentListName: string;
  allRpgLists: { [key: string]: string[] };
  onEditList: () => void;
  onBackToLists: () => void;
  showModal: (
    title: string,
    message: string,
    isConfirm?: boolean
  ) => Promise<boolean>;
}

const RandomizerScreen: React.FC<RandomizerScreenProps> = ({
  currentListName,
  allRpgLists,
  onEditList,
  onBackToLists,
  showModal,
}) => {
  const [resultText, setResultText] = useState<string>(
    `Clique para sortear de "${currentListName}"!`
  );
  const [resultDisplayClass, setResultDisplayClass] = useState<string>(
    "mt-4 p-6 bg-gradient-to-r from-blue-400 to-indigo-500 text-white text-center rounded-xl shadow-lg transform scale-100 opacity-100 flex items-center justify-center min-h-[80px] w-full"
  );

  const randomizeItem = useCallback(async () => {
    let currentPath: string[] = [currentListName];
    let currentItems: string[] = allRpgLists[currentListName]
      ? allRpgLists[currentListName].filter((item) => item.trim() !== "")
      : [];
    let finalItem: string = "";
    let foundFinalItem: boolean = false;
    let maxDepth: number = 10;

    while (!foundFinalItem && maxDepth > 0) {
      maxDepth--;
      if (currentItems.length === 0) {
        await showModal(
          "Erro",
          `A lista "${
            currentPath[currentPath.length - 1]
          }" está vazia ou não existe. Não é possível sortear.`
        );
        setResultText(
          `Erro: Lista vazia em "${currentPath[currentPath.length - 1]}"`
        );
        setResultDisplayClass(
          "mt-4 p-6 bg-red-400 text-white text-center rounded-xl shadow-lg transform scale-100 opacity-100 flex items-center justify-center min-h-[80px] w-full"
        );
        return;
      }

      const randomIndex: number = Math.floor(
        Math.random() * currentItems.length
      );
      const selectedItem: string = currentItems[randomIndex];

      if (selectedItem.startsWith("LIST_REF:")) {
        const nextListName: string = selectedItem
          .substring("LIST_REF:".length)
          .trim();
        if (allRpgLists[nextListName]) {
          if (currentPath.includes(nextListName)) {
            await showModal(
              "Erro",
              `Loop de referência detectado com a lista "${nextListName}". Não é possível sortear.`
            );
            setResultText(`Erro: Loop de referência em "${nextListName}"`);
            setResultDisplayClass(
              "mt-4 p-6 bg-red-400 text-white text-center rounded-xl shadow-lg transform scale-100 opacity-100 flex items-center justify-center min-h-[80px] w-full"
            );
            return;
          }
          currentPath.push(nextListName);
          currentItems = allRpgLists[nextListName].filter(
            (item) => item.trim() !== ""
          );
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

    setResultText(`${currentPath.join(" -> ")} -> ${finalItem}`);
    setResultDisplayClass(
      "mt-4 p-6 bg-gradient-to-r from-green-400 to-emerald-500 text-white text-center rounded-xl shadow-lg transform scale-100 opacity-100 flex items-center justify-center min-h-[80px] w-full"
    );
  }, [currentListName, allRpgLists, showModal]);

  return (
    <div id="randomizer-screen" className="flex flex-col items-center p-4">
      <h2
        id="currentListNameTitle"
        className="text-2xl font-bold text-gray-700 mb-4 text-center"
      >
        {currentListName}
      </h2>
      <p className="text-gray-600 mb-4 text-center">
        Clique para sortear um item ou edite a lista.
      </p>
      <button
        onClick={randomizeItem}
        className="w-full bg-purple-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75 shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 mb-4"
      >
        Sortear Item!
      </button>
      <div id="resultDisplay" className={resultDisplayClass}>
        <p className="text-2xl font-extrabold" id="resultText">
          {resultText}
        </p>
      </div>
      <button
        onClick={onEditList}
        className="w-full bg-gray-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-75 shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 mt-6"
      >
        Editar Lista
      </button>
      <button
        onClick={onBackToLists}
        className="w-full bg-gray-400 text-white font-bold py-3 px-6 rounded-xl hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-75 shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 mt-4"
      >
        Voltar para Listas
      </button>
    </div>
  );
};

export default RandomizerScreen;
