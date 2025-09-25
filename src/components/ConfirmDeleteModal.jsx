// src/components/ConfirmDeleteModal.jsx
import React from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const ConfirmDeleteModal = ({ onConfirm, onCancel, message }) => {
  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4">
      <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary p-6 rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-start gap-4">
          <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50 sm:mx-0 sm:h-10 sm:w-10">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-600 dark:text-red-400" aria-hidden="true" />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary">
              Confirmar Exclusão
            </h3>
            <div className="mt-2">
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                {message || 'Você tem certeza que deseja remover este item? Esta ação não pode ser desfeita.'}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
          <button
            type="button"
            className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:w-auto"
            onClick={onConfirm}
          >
            Excluir
          </button>
          <button
            type="button"
            className="mt-3 inline-flex w-full justify-center rounded-md bg-light-bg-secondary dark:bg-dark-bg-secondary px-3 py-2 text-sm font-semibold text-light-text-primary dark:text-dark-text-primary shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-dark-border hover:bg-gray-50 dark:hover:bg-dark-border sm:mt-0 sm:w-auto"
            onClick={onCancel}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;