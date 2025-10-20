// src/components/TabButton.jsx
import React from "react";

export default function TabButton({ label, isActive, onClick, isDisabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      className={`px-4 py-2 text-sm font-medium rounded-md transition ${
        isActive ? "bg-blue-800 text-white" : "bg-transparent text-gray-700 hover:bg-gray-100"
      } ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {label}
    </button>
  );
}
