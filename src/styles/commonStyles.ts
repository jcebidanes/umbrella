// Common Tailwind style strings for buttons, inputs, containers, etc.

export const buttonBase =
    "w-full min-h-[48px] font-bold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 focus:outline-none focus:ring-2 focus:ring-opacity-75 transform hover:-translate-y-1";

export const buttonPrimary =
    `${buttonBase} bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500`;
export const buttonSecondary =
    `${buttonBase} bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500`;
export const buttonDanger =
    `${buttonBase} bg-red-600 text-white hover:bg-red-700 focus:ring-red-500`;
export const buttonSuccess =
    `${buttonBase} bg-green-600 text-white hover:bg-green-700 focus:ring-green-500`;
export const buttonWarning =
    `${buttonBase} bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-500`;
export const buttonIndigo =
    `${buttonBase} bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500`;

export const inputBase =
    "w-full p-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent text-gray-700 placeholder-gray-400 transition-all duration-200 text-base sm:text-lg";

export const inputSmall =
    "w-20 p-3 min-h-[44px] border rounded-lg text-base sm:text-lg";

export const containerBase =
    "flex flex-col items-center p-2 sm:p-4 max-w-full";
export const cardBase =
    "bg-white p-2 sm:p-8 rounded-2xl shadow-xl max-w-lg w-full transform transition-all duration-300 hover:shadow-2xl";

export const tableBase =
    "w-full text-left border-collapse min-w-[320px] max-w-full";
export const thBase =
    "p-2 border-b text-base sm:text-lg";
export const tdBase =
    "p-2 border-b";
