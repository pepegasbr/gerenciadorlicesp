import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import SpecializationManager from './components/SpecializationManager';
import LicenseManager from './components/LicenseManager';
import BackupManager from './components/BackupManager';
import Manual from './components/Manual';
import type { AppView, Executive, License } from './types';
import { getData, updateData } from './services/apiService';

// The App Script URL is now hardcoded as per the user's request.
const APP_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxxOZBdKxJNKEDcwJV6sXf4QlhbBNTw2WzocHZSb6VPc-pEbfabbXrwu92U0OZE3OZU/exec';

const App: React.FC = () => {
  const [executives, setExecutives] = useState<Executive[]>([]);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<AppView>('specializations');
  const [referenceMonth, setReferenceMonth] = useState<string>('');
  const [referenceYear, setReferenceYear] = useState<number>(0);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getData(APP_SCRIPT_URL);
      setExecutives(data.executives || []);
      setLicenses(data.licenses || []);
      setReferenceMonth(data.referenceMonth || '');
      setReferenceYear(data.referenceYear || new Date().getFullYear());
    } catch (err) {
      setError('Falha ao buscar dados. Verifique a URL do script e as permissões da planilha.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDataUpdate = async (action: string, payload: any) => {
      setIsLoading(true);
      try {
          await updateData(APP_SCRIPT_URL, action, payload);
          if (action !== 'CREATE_BACKUP') {
            await fetchData(); // Refetch data after update to ensure consistency
          }
      } catch (err) {
          setError(err instanceof Error ? `Falha ao atualizar dados: ${err.message}` : 'Ocorreu um erro desconhecido.');
          console.error(err);
      } finally {
          setIsLoading(false);
      }
  };
  
  const handleSetReferencePeriod = async (month: string, year: number) => {
    const originalMonth = referenceMonth;
    const originalYear = referenceYear;
    setReferenceMonth(month);
    setReferenceYear(year);

    try {
      await updateData(APP_SCRIPT_URL, 'UPDATE_REFERENCE_PERIOD', { month, year });
    } catch (err)
 {
      setError('Falha ao atualizar o período de referência.');
      setReferenceMonth(originalMonth);
      setReferenceYear(originalYear);
      console.error(err);
    }
  };

  const renderContent = () => {
    if (isLoading && activeView !== 'backup' && activeView !== 'manual') {
        return (
            <div className="flex justify-center items-center h-64">
                <svg className="animate-spin h-8 w-8 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </div>
        )
    }
    
    if (error) {
        return (
          <div className="p-8 text-center text-red-400">
            <p>{error}</p>
          </div>
        );
    }

    switch (activeView) {
      case 'specializations':
        return <SpecializationManager executives={executives} onUpdate={handleDataUpdate} />;
      case 'licenses':
        return (
          <LicenseManager
            licenses={licenses}
            executives={executives}
            onUpdate={handleDataUpdate}
            referenceMonth={referenceMonth}
            referenceYear={referenceYear}
            onSetReferencePeriod={handleSetReferencePeriod}
          />
        );
      case 'backup':
        return <BackupManager onUpdate={handleDataUpdate} executives={executives} />;
      case 'manual':
        return <Manual />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header activeView={activeView} setActiveView={setActiveView} />
      <main className="flex-grow">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="my-8 glass-card rounded-lg shadow-2xl min-h-[400px]">
            {renderContent()}
          </div>
        </div>
      </main>
      <footer className="text-center py-4 text-sm text-gray-400">
        <p>Desenvolvido por Pegas</p>
      </footer>
    </div>
  );
};

export default App;