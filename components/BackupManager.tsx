import React, { useState } from 'react';
import type { Executive } from '../types';

interface BackupManagerProps {
    onUpdate: (action: string, payload: any) => Promise<void>;
    executives: Executive[];
}

const BackupManager: React.FC<BackupManagerProps> = ({ onUpdate, executives }) => {
    const [nickname, setNickname] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleSaveBackup = async () => {
        if (!nickname.trim()) {
            setError('O campo nickname é obrigatório.');
            return;
        }
         if (executives.length === 0) {
            setError('Não há executivos no quadro de especializações para fazer backup.');
            return;
        }
        
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const executivesForBackup = executives.map(exec => ({
                ...exec,
                // Garante que apenas a parte YYYY-MM-DD da data seja enviada, removendo a informação de hora/fuso horário.
                concessionDate: exec.concessionDate.split('T')[0],
            }));
            await onUpdate('CREATE_BACKUP', { nickname, executives: executivesForBackup });
            setSuccessMessage('Backup do quadro atual salvo com sucesso na sua Planilha Google!');
            // Clear field after success
            setNickname('');
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.';
            setError(`Falha ao salvar o backup: ${message}`);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="sm:flex sm:items-center">
                    <div className="sm:flex-auto">
                        <h1 className="text-xl font-semibold text-white">Backup da Listagem de Especializações</h1>
                        <p className="mt-2 text-sm text-gray-300">
                           Crie um backup do "Quadro de Especializações" atual. Cada backup é salvo com seu nome e a data, preservando o histórico.
                        </p>
                    </div>
                </div>

                <div className="mt-6 space-y-6">
                     <div>
                        <label htmlFor="nickname" className="block text-sm font-medium text-gray-300">
                            Seu Nickname
                        </label>
                        <div className="mt-1">
                            <input
                                type="text"
                                name="nickname"
                                id="nickname"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                className="block w-full max-w-xs rounded-md shadow-sm sm:text-sm"
                                placeholder="Seu nome de usuário"
                            />
                        </div>
                    </div>

                    <div className="p-4 bg-gray-900/50 border border-white/10 rounded-md">
                        <h3 className="text-sm font-medium text-gray-200">Pré-visualização do Backup</h3>
                        <p className="mt-1 text-sm text-gray-400">
                            Você está prestes a criar um backup do quadro de especializações atual, que contém <strong>{executives.length}</strong> executivo(s).
                        </p>
                    </div>

                    {error && (
                        <div className="rounded-md bg-red-900/40 p-4">
                            <p className="text-sm font-medium text-red-200">{error}</p>
                        </div>
                    )}

                    {successMessage && (
                        <div className="rounded-md bg-green-900/40 p-4">
                            <p className="text-sm font-medium text-green-200">{successMessage}</p>
                        </div>
                    )}

                    <div className="flex justify-end items-center gap-2">
                         <a
                            href="https://docs.google.com/spreadsheets/d/16_VGxjpvjqAIMwCKotiaf-szOKPo2TADcaYbvyciTSo/edit?gid=2013340827#gid=2013340827"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center rounded-md border border-white/20 px-4 py-2 text-sm font-medium text-gray-200 shadow-sm hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors duration-300"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            Abrir Planilha
                        </a>
                        <button
                            type="button"
                            onClick={handleSaveBackup}
                            disabled={isLoading}
                            className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors duration-300"
                        >
                             {isLoading && <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                            {isLoading ? 'Salvando...' : 'Salvar Backup'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BackupManager;