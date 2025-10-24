
import React, { useState, useMemo, useEffect } from 'react';
import type { License, Executive } from '../types';
import { formatDisplayDate } from '../utils/dateFormatter';

interface LicenseManagerProps {
  licenses: License[];
  executives: Executive[];
  onUpdate: (action: string, payload: any) => Promise<void>;
  referenceMonth: string;
  referenceYear: number;
  onSetReferencePeriod: (month: string, year: number) => void;
}

const EditPeriodModal: React.FC<{
  currentMonth: string;
  currentYear: number;
  onSave: (month: string, year: number) => void;
  onClose: () => void;
}> = ({ currentMonth, currentYear, onSave, onClose }) => {
  const [month, setMonth] = useState(currentMonth);
  const [year, setYear] = useState(currentYear);
  
  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(month, year);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 glass-modal-container">
      <div className="glass-modal rounded-lg shadow-xl p-6 w-full max-w-sm">
        <h2 className="text-lg font-bold mb-4">Editar Período de Referência</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="month" className="block text-sm font-medium text-gray-300">Mês</label>
              <select
                id="month"
                value={month}
                onChange={e => setMonth(e.target.value)}
                className="mt-1 block w-full rounded-md shadow-sm sm:text-sm"
              >
                {months.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="year" className="block text-sm font-medium text-gray-300">Ano</label>
              <input
                type="number"
                id="year"
                value={year}
                onChange={e => setYear(parseInt(e.target.value, 10))}
                className="mt-1 block w-full rounded-md shadow-sm sm:text-sm"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-md border border-white/20 hover:bg-white/10">Cancelar</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
};


const OrganizeModal: React.FC<{
  licensesToRemove: License[];
  onConfirm: () => void;
  onClose: () => void;
  isLoading: boolean;
}> = ({ licensesToRemove, onConfirm, onClose, isLoading }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 glass-modal-container">
            <div className="glass-modal rounded-lg shadow-xl p-6 w-full max-w-lg">
                <h2 className="text-lg font-bold mb-4">Organizar e Limpar Licenças</h2>
                {licensesToRemove.length > 0 ? (
                    <>
                        <p className="text-sm text-gray-300 mb-4">
                            Com base na regra quinzenal, as seguintes licenças concluídas serão removidas. Esta ação é permanente.
                        </p>
                        <div className="max-h-60 overflow-y-auto border border-white/20 rounded-md p-2">
                             <ul className="text-sm space-y-1">
                                {licensesToRemove.map(license => (
                                    <li key={license.id} className="p-2 bg-gray-900/50 rounded flex justify-between">
                                        <span className="font-medium">{license.executiveNickname}</span>
                                        <span className="text-gray-400">Retornou em: {formatDisplayDate(license.returnDate)}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="mt-4 p-3 bg-yellow-900/50 border border-yellow-700/50 rounded-md">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 00-1 1v3a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-yellow-300">
                                        Atenção: Após a remoção, clique em "Organizar Dados" novamente para garantir que todas as licenças antigas foram processadas corretamente.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <p className="text-sm text-center py-8 text-gray-300">
                        Nenhuma licença antiga para remover. Tudo está organizado!
                    </p>
                )}
                <div className="mt-6 flex justify-end space-x-2">
                    <button type="button" onClick={onClose} disabled={isLoading} className="px-4 py-2 text-sm font-medium rounded-md border border-white/20 hover:bg-white/10 disabled:opacity-50">Cancelar</button>
                    {licensesToRemove.length > 0 && (
                        <button type="button" onClick={onConfirm} disabled={isLoading} className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50">
                             {isLoading && <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                            {isLoading ? 'Removendo...' : `Confirmar Remoção (${licensesToRemove.length})`}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};


const LicenseManager: React.FC<LicenseManagerProps> = ({ licenses, onUpdate, executives, referenceMonth, referenceYear, onSetReferencePeriod }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [currentLicense, setCurrentLicense] = useState<License | null>(null);
  const [isOrganizeModalOpen, setIsOrganizeModalOpen] = useState(false);
  const [licensesToRemove, setLicensesToRemove] = useState<License[]>([]);
  const [isOrganizing, setIsOrganizing] = useState(false);
  const [isEditPeriodModalOpen, setIsEditPeriodModalOpen] = useState(false);

  const activeExecutives = useMemo(() => executives.filter(e => e.status !== 'inativo'), [executives]);
  
  const handleOpenModal = (license: License | null = null) => {
    setCurrentLicense(license);
    setIsModalOpen(true);
  };
  
  const handleOpenReturnModal = (license: License) => {
    setCurrentLicense(license);
    setIsReturnModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsReturnModalOpen(false);
    setCurrentLicense(null);
  };

  const handleSave = (licenseData: Omit<License, 'id'>) => {
    if (currentLicense) {
      onUpdate('UPDATE_LICENSE', { ...currentLicense, ...licenseData });
    } else {
      onUpdate('ADD_LICENSE', licenseData);
    }
    handleCloseModal();
  };
  
  const handleSaveReturnDate = (returnDate: string) => {
    if (currentLicense) {
      onUpdate('UPDATE_LICENSE', { ...currentLicense, returnDate });
    }
    handleCloseModal();
  };

  const handleOpenOrganizeModal = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day

    const dayOfMonth = today.getDate();
    
    let cutoffDate: Date;
    if (dayOfMonth < 16) {
        // Cutoff is the 1st of the current month
        cutoffDate = new Date(today.getFullYear(), today.getMonth(), 1);
    } else {
        // Cutoff is the 16th of the current month
        cutoffDate = new Date(today.getFullYear(), today.getMonth(), 16);
    }
    
    const toRemove = licenses.filter(license => {
        if (!license.returnDate) return false;
        // new Date() with YYYY-MM-DD can be off by a day due to timezone.
        // Replacing dashes with slashes is a common way to parse it as local time.
        const returnDateObj = new Date(license.returnDate.replace(/-/g, '/'));
        return returnDateObj < cutoffDate;
    });

    setLicensesToRemove(toRemove);
    setIsOrganizeModalOpen(true);
  };

  const handleConfirmRemoval = async () => {
      setIsOrganizing(true);
      const promises = licensesToRemove.map(license => onUpdate('DELETE_LICENSE', { id: license.id }));
      try {
          await Promise.all(promises);
      } catch (error) {
          console.error("Failed to remove licenses:", error);
      } finally {
          setIsOrganizing(false);
          setIsOrganizeModalOpen(false);
          setLicensesToRemove([]);
      }
  };

  return (
    <>
      <div className="glass-card rounded-lg p-4 sm:p-6 lg:p-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-xl font-semibold text-white">Quadro de Licenças</h1>
            <p className="mt-2 text-sm text-gray-300">
              Gerencie as licenças dos executivos e seus respectivos períodos.
            </p>
            <div className="mt-2 text-sm text-gray-300">
              Período de Referência: <strong className="text-white">{referenceMonth && referenceYear ? `${referenceMonth.charAt(0).toUpperCase() + referenceMonth.slice(1)} de ${referenceYear}` : 'Carregando...'}</strong>
              <button onClick={() => setIsEditPeriodModalOpen(true)} title="Editar período de referência" className="ml-2 inline-flex align-middle">
                <svg className="w-4 h-4 text-gray-400 hover:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 3.732z" /></svg>
              </button>
            </div>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none flex items-center gap-2">
            <button
              onClick={handleOpenOrganizeModal}
              type="button"
              className="inline-flex items-center justify-center rounded-md border border-yellow-500 px-4 py-2 text-sm font-medium text-yellow-300 shadow-sm hover:bg-yellow-500/10 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 sm:w-auto transition-colors duration-300"
            >
              Organizar Dados
            </button>
            <button
              onClick={() => handleOpenModal()}
              type="button"
              disabled={activeExecutives.length === 0}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:w-auto disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors duration-300"
              title={activeExecutives.length === 0 ? "Adicione um executivo primeiro" : ""}
            >
              Adicionar Licença
            </button>
          </div>
        </div>
        <div className="mt-8 flex flex-col">
          <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-white/5">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-6">Nickname</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">Início</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">Fim</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">Retorno</th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Ações</span></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800 bg-transparent">
                    {licenses.map((license) => (
                      <tr key={license.id} className="hover:bg-white/5 transition-colors duration-200">
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-6">{license.executiveNickname || 'Desconhecido'}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">{formatDisplayDate(license.startDate)}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">{formatDisplayDate(license.endDate)}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">{formatDisplayDate(license.returnDate)}</td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 space-x-2">
                          <button 
                              onClick={() => handleOpenReturnModal(license)} 
                              disabled={!!license.returnDate}
                              className="text-green-400 hover:text-green-200 disabled:text-gray-500 disabled:cursor-not-allowed"
                            >
                            Retornou
                          </button>
                          <button onClick={() => handleOpenModal(license)} className="text-primary-400 hover:text-primary-200">Editar</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && <LicenseModal license={currentLicense} executives={activeExecutives} onSave={handleSave} onClose={handleCloseModal} />}
      {isReturnModalOpen && currentLicense && 
        <ReturnModal 
            license={currentLicense} 
            executiveNickname={currentLicense.executiveNickname || 'Desconhecido'}
            onSave={handleSaveReturnDate} 
            onClose={handleCloseModal} 
        />}
      {isOrganizeModalOpen && 
        <OrganizeModal 
            licensesToRemove={licensesToRemove}
            onConfirm={handleConfirmRemoval}
            onClose={() => setIsOrganizeModalOpen(false)}
            isLoading={isOrganizing}
        />}
        {isEditPeriodModalOpen && (
            <EditPeriodModal
                currentMonth={referenceMonth}
                currentYear={referenceYear}
                onSave={onSetReferencePeriod}
                onClose={() => setIsEditPeriodModalOpen(false)}
            />
        )}
    </>
  );
};

const ReturnModal: React.FC<{
    license: License;
    executiveNickname: string;
    onSave: (returnDate: string) => void;
    onClose: () => void;
}> = ({ license, executiveNickname, onSave, onClose }) => {
    const today = new Date().toISOString().split('T')[0];
    const [returnDate, setReturnDate] = useState(today);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(returnDate);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 glass-modal-container">
            <div className="glass-modal rounded-lg shadow-xl p-6 w-full max-w-sm">
                <h2 className="text-lg font-bold mb-4">Registrar Retorno da Licença</h2>
                <form onSubmit={handleSubmit}>
                    <p className="text-sm mb-4 text-gray-300">
                        Defina a data de retorno para <strong className="font-semibold text-gray-100">{executiveNickname}</strong>.
                    </p>
                    <div>
                        <label htmlFor="returnDate" className="block text-sm font-medium text-gray-300">Data de Retorno</label>
                        <input 
                            type="date" 
                            id="returnDate" 
                            value={returnDate} 
                            onChange={e => setReturnDate(e.target.value)} 
                            required 
                            className="mt-1 block w-full rounded-md shadow-sm sm:text-sm" />
                    </div>
                    <div className="mt-6 flex justify-end space-x-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-md border border-white/20 hover:bg-white/10">Cancelar</button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700">Salvar Retorno</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const LicenseModal: React.FC<{
    license: License | null;
    executives: Executive[];
    onSave: (data: Omit<License, 'id'>) => void;
    onClose: () => void;
}> = ({ license, executives, onSave, onClose }) => {
    const [executiveNickname, setExecutiveNickname] = useState(license?.executiveNickname || (executives.length > 0 ? executives[0].nickname : ''));
    const [startDate, setStartDate] = useState(license?.startDate || '');
    const [endDate, setEndDate] = useState(license?.endDate || '');
    const [returnDate, setReturnDate] = useState(license?.returnDate || '');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredExecutives = useMemo(() => {
        if (!searchTerm) {
            return executives;
        }
        return executives.filter(e =>
            e.nickname.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [executives, searchTerm]);

    useEffect(() => {
        // If the current selection is not in the filtered list (and we are not editing), update it.
        const isSelectedInList = filteredExecutives.some(e => e.nickname === executiveNickname);
        if (!license && !isSelectedInList) {
            setExecutiveNickname(filteredExecutives.length > 0 ? filteredExecutives[0].nickname : '');
        }
    }, [searchTerm, filteredExecutives, executiveNickname, license]);


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!executiveNickname || !startDate || !endDate) return;
        onSave({ executiveNickname, startDate, endDate, returnDate: returnDate || null });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center glass-modal-container">
            <div className="glass-modal rounded-lg shadow-xl p-6 w-full max-w-md">
                <h2 className="text-lg font-bold mb-4">{license ? 'Editar Licença' : 'Adicionar Licença'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        {!license && (
                            <div>
                                <label htmlFor="executive-search" className="block text-sm font-medium text-gray-300">Buscar Executivo</label>
                                <input
                                    type="text"
                                    id="executive-search"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    placeholder="Digite para filtrar..."
                                    className="mt-1 block w-full rounded-md shadow-sm sm:text-sm"
                                />
                            </div>
                        )}
                        <div>
                            <label htmlFor="executive" className="block text-sm font-medium text-gray-300">Executivo</label>
                            <select id="executive" value={executiveNickname} onChange={e => setExecutiveNickname(e.target.value)} required disabled={!!license} className="mt-1 block w-full rounded-md shadow-sm sm:text-sm disabled:bg-gray-700/50">
                                {filteredExecutives.map(e => <option key={e.id} value={e.nickname}>{e.nickname}</option>)}
                                {filteredExecutives.length === 0 && <option disabled value="">Nenhum executivo encontrado</option>}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="startDate" className="block text-sm font-medium text-gray-300">Data de Início</label>
                            <input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} required className="mt-1 block w-full rounded-md shadow-sm sm:text-sm"/>
                        </div>
                        <div>
                            <label htmlFor="endDate" className="block text-sm font-medium text-gray-300">Data de Fim</label>
                            <input type="date" id="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} required className="mt-1 block w-full rounded-md shadow-sm sm:text-sm"/>
                        </div>
                        <div>
                            <label htmlFor="returnDate" className="block text-sm font-medium text-gray-300">Data de Retorno (opcional)</label>
                            <input type="date" id="returnDate" value={returnDate || ''} onChange={e => setReturnDate(e.target.value)} className="mt-1 block w-full rounded-md shadow-sm sm:text-sm"/>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end space-x-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium bg-white/5 border border-white/20 rounded-md shadow-sm hover:bg-white/10">Cancelar</button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LicenseManager;