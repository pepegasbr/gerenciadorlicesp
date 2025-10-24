
import React, { useState } from 'react';

interface ConfigModalProps {
    onSave: (url: string) => void;
}

const ConfigModal: React.FC<ConfigModalProps> = ({ onSave }) => {
    const [url, setUrl] = useState('');
    const [error, setError] = useState('');

    const handleSave = () => {
        if (url && url.startsWith('https://script.google.com/macros/s/')) {
            setError('');
            onSave(url);
        } else {
            setError('Por favor, insira uma URL válida de Aplicativo Web do Google Apps Script.');
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-90 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6 md:p-8 w-full max-w-2xl text-gray-900 dark:text-gray-100">
                <div className="text-center">
                    <svg className="mx-auto h-12 w-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                    <h1 className="text-2xl font-bold mt-4">Configuração Inicial Necessária</h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        Para conectar este aplicativo à sua Planilha Google, você precisa de uma URL de Aplicativo Web.
                    </p>
                </div>

                <div className="mt-6 bg-blue-50 dark:bg-gray-800 p-4 rounded-lg text-sm text-gray-700 dark:text-gray-300">
                   <p>
                     Não tem uma URL? Vá para a aba <strong>"Gerador de Script"</strong> na aplicação principal, gere o script, siga as instruções de implantação para obter sua URL e cole-a aqui.
                     <strong> Você pode recarregar a página para ver a aba do gerador.</strong>
                   </p>
                </div>

                <div className="mt-6">
                    <label htmlFor="app-script-url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        URL do seu Aplicativo Web
                    </label>
                    <div className="mt-1">
                        <input
                            type="url"
                            id="app-script-url"
                            value={url}
                            onChange={e => setUrl(e.target.value)}
                            className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="https://script.google.com/macros/s/..."
                        />
                    </div>
                    {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
                </div>

                <div className="mt-8 flex justify-end">
                    <button
                        type="button"
                        onClick={handleSave}
                        className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        Salvar e Conectar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfigModal;
