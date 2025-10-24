
import React, { useState, useCallback } from 'react';
import { generateAppScript } from '../services/geminiService';

interface ScriptGeneratorProps {
  // onResetUrl: () => void;
}

const ScriptGenerator: React.FC<ScriptGeneratorProps> = (/*{ onResetUrl }*/) => {
  const [generatedScript, setGeneratedScript] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleGenerateScript = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setGeneratedScript('');
    setCopySuccess(false);

    try {
      const script = await generateAppScript();
      setGeneratedScript(script);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(generatedScript).then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-xl font-semibold text-white">Gerador de Google Apps Script</h1>
        <p className="mt-2 text-sm text-gray-300">
          Este script funcionará como o backend da sua aplicação, conectando-a diretamente à sua Planilha Google.
        </p>
        
        <div className="mt-6 bg-primary-50 dark:bg-primary-900/20 border-l-4 border-primary-400 p-4 rounded-md">
            <div className="flex">
                <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-primary-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                </div>
                <div className="ml-3">
                    <h3 className="text-sm font-medium text-primary-800 dark:text-primary-200">Como configurar seu Backend</h3>
                    <div className="mt-2 text-sm text-primary-700 dark:text-primary-300 space-y-2">
                        <p><strong>1. Gerar Script:</strong> Clique no botão "Gerar Script" abaixo.</p>
                        <p><strong>2. Copiar e Colar:</strong> Copie o código gerado. Abra sua Planilha Google, vá em <em>Extensões &gt; Apps Script</em>, apague o código existente e cole o novo.</p>
                        <p><strong>3. Salvar e Implantar:</strong> Salve o projeto. Clique em "Implantar" &gt; "Nova implantação".</p>
                        <p><strong>4. Configurar Implantação:</strong> Selecione o tipo "App da Web". Em "Configurações", defina "Executar como" para "Eu" e "Quem pode acessar" para "Qualquer pessoa". Clique em "Implantar".</p>
                        <p><strong>5. Autorizar e Copiar URL:</strong> Autorize as permissões necessárias. Copie a "URL do app da Web" fornecida.</p>
                        <p><strong>6. Configurar no App:</strong> Volte para esta aplicação e cole a URL na caixa de configuração inicial.</p>
                    </div>
                </div>
            </div>
        </div>

        <div className="mt-6 flex items-center gap-4">
          <button
            onClick={handleGenerateScript}
            disabled={isLoading}
            type="button"
            className="inline-flex items-center gap-2 rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:bg-gray-400"
          >
            {isLoading ? (
                <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Gerando...
                </>
            ) : (
                <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
                Gerar Script do Backend
                </>
            )}
          </button>
        </div>

        {error && <p className="mt-4 text-red-500">{error}</p>}

        {generatedScript && (
          <div className="mt-6 relative">
            <h2 className="text-lg font-medium mb-2 text-white">Script Gerado</h2>
            <button
              onClick={handleCopy}
              className="absolute top-0 right-0 mt-2 mr-2 px-3 py-1 text-sm bg-gray-600 hover:bg-gray-700 text-white rounded-md"
            >
              {copySuccess ? 'Copiado!' : 'Copiar'}
            </button>
            <pre className="bg-gray-800 text-white p-4 rounded-lg overflow-x-auto text-sm">
              <code>{generatedScript}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScriptGenerator;