
import React, { useState } from 'react';
import type { Executive } from '../types';
import { SpecializationLevel } from '../types';
import { formatDisplayDate } from '../utils/dateFormatter';

type ParsedExecutive = Omit<Executive, 'id'>;
type UpdatePayload = { executive: Executive; changes: Partial<ParsedExecutive> };

interface ImportModalProps {
    onClose: () => void;
    executives: Executive[];
    onUpdate: (action: string, payload: any) => Promise<void>;
}

const monthMap: { [key: string]: string } = {
    'Jan': '01', 'Fev': '02', 'Mar': '03', 'Abr': '04', 'Mai': '05', 'Jun': '06',
    'Jul': '07', 'Ago': '08', 'Set': '09', 'Out': '10', 'Nov': '11', 'Dez': '12'
};

const parseExecutiveList = (text: string): ParsedExecutive[] => {
    const lines = text.split('\n');
    const results: ParsedExecutive[] = [];
    let currentSpecialization = SpecializationLevel.INTERMEDIARIA;
    let onLicenseSection = false;

    for (const line of lines) {
        const trimmedLine = line.trim();
        const upperCaseLine = trimmedLine.toUpperCase();

        if (upperCaseLine.startsWith('ESPECIALIZAÇÃO AVANÇADA')) {
            currentSpecialization = SpecializationLevel.AVANCADA;
            onLicenseSection = upperCaseLine.includes('LICENÇA');
        } else if (upperCaseLine.startsWith('ESPECIALIZAÇÃO INTERMEDIÁRIA')) {
            currentSpecialization = SpecializationLevel.INTERMEDIARIA;
            onLicenseSection = upperCaseLine.includes('LICENÇA');
        } else if (/^\d+\./.test(trimmedLine)) {
            const bracketIndex = trimmedLine.indexOf('[');
            
            if (bracketIndex > -1) {
                const relevantPart = trimmedLine.substring(0, bracketIndex).trim();

                // 1. Extract Date
                let concessionDate = '';
                const dateMatch = relevantPart.match(/(\d{2})\s(\w{3})\s(\d{4})/);
                if (dateMatch) {
                    const day = dateMatch[1];
                    const monthAbbr = dateMatch[2];
                    const year = dateMatch[3];
                    const month = monthMap[monthAbbr];
                    if (month) {
                        concessionDate = `${year}-${month}-${day}`;
                    }
                }

                // 2. Extract Nickname
                const nameAndRankPart = dateMatch ? relevantPart.replace(dateMatch[0], '').trim() : relevantPart;
                const words = nameAndRankPart.split(' ');
                const nickname = words.pop();

                if (nickname) {
                    results.push({
                        nickname,
                        specialization: currentSpecialization,
                        status: onLicenseSection ? 'licença' : 'ativo',
                        concessionDate
                    });
                }
            }
        }
    }
    return results;
};


const ImportModal: React.FC<ImportModalProps> = ({ onClose, executives, onUpdate }) => {
    const [step, setStep] = useState(1);
    const [listText, setListText] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [additions, setAdditions] = useState<ParsedExecutive[]>([]);
    const [updates, setUpdates] = useState<UpdatePayload[]>([]);
    const [removals, setRemovals] = useState<Executive[]>([]);

    const handleProcess = () => {
        const parsedList = parseExecutiveList(listText);
        if(parsedList.length === 0){
             alert('Nenhum executivo válido foi encontrado. Por favor, verifique o formato da lista colada.');
             return;
        }

        const parsedMap = new Map(parsedList.map(p => [p.nickname.toLowerCase(), p]));
        const existingMap = new Map(executives.map(e => [e.nickname.toLowerCase(), e]));

        // Additions: parsed executives that don't exist in the current list.
        const toAdd: ParsedExecutive[] = parsedList
            .filter(p => !existingMap.has(p.nickname.toLowerCase()));

        const toRemove: Executive[] = executives.filter(e => !parsedMap.has(e.nickname.toLowerCase()));
        const toUpdate: UpdatePayload[] = [];
        
        for (const parsed of parsedList) {
            const existing = existingMap.get(parsed.nickname.toLowerCase());
            if (existing) {
                const changes: Partial<ParsedExecutive> = {};
                let needsUpdate = false;

                if (existing.specialization !== parsed.specialization) {
                    changes.specialization = parsed.specialization;
                    needsUpdate = true;
                }
                if (existing.status !== parsed.status) {
                    changes.status = parsed.status;
                    needsUpdate = true;
                }
                 if (existing.concessionDate !== parsed.concessionDate && parsed.concessionDate) {
                    changes.concessionDate = parsed.concessionDate;
                    needsUpdate = true;
                }

                if (needsUpdate) {
                    toUpdate.push({ executive: existing, changes });
                }
            }
        }

        setAdditions(toAdd);
        setUpdates(toUpdate);
        setRemovals(toRemove);
        setStep(2);
    };
    
    const handleConfirm = async () => {
        setIsLoading(true);
        const promises = [];

        for (const exec of removals) promises.push(onUpdate('DELETE_EXECUTIVE', { id: exec.id }));
        
        for (const exec of additions) {
            if (!exec.concessionDate) {
                alert(`Por favor, defina a data de concessão para o novo executivo: ${exec.nickname}`);
                setIsLoading(false);
                return;
            }
            promises.push(onUpdate('ADD_EXECUTIVE', exec));
        }

        for (const { executive, changes } of updates) {
            const finalPayload = { ...executive, ...changes };
            if (!finalPayload.concessionDate) {
                 alert(`Por favor, defina a data de concessão para o executivo a ser alterado: ${finalPayload.nickname}`);
                 setIsLoading(false);
                 return;
            }
            promises.push(onUpdate('UPDATE_EXECUTIVE', finalPayload));
        }

        await Promise.all(promises);
        setIsLoading(false);
        onClose();
    };

    const handleDateChange = (index: number, date: string, type: 'add' | 'update') => {
        if(type === 'add') {
            const newAdditions = [...additions];
            newAdditions[index].concessionDate = date;
            setAdditions(newAdditions);
        } else {
            const newUpdates = [...updates];
            // Ensure the changes object exists
            if (!newUpdates[index].changes) {
                newUpdates[index].changes = {};
            }
            newUpdates[index].changes.concessionDate = date;
            setUpdates(newUpdates);
        }
    };
    
    const noChanges = additions.length === 0 && updates.length === 0 && removals.length === 0;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-start p-4 overflow-auto glass-modal-container">
            <div className="glass-modal rounded-lg shadow-xl p-6 w-full max-w-3xl my-8">
                {step === 1 && (
                    <>
                        <h2 className="text-lg font-bold mb-4">Importar e Sincronizar Lista</h2>
                        <p className="text-sm text-gray-300 mb-4">Cole a lista do RCCSystem. O sistema irá comparar com o quadro atual e propor as alterações necessárias.</p>
                        <textarea value={listText} onChange={(e) => setListText(e.target.value)} rows={15} className="w-full p-2 border rounded-md bg-gray-900/50 border-white/20 text-sm" />
                        <div className="mt-6 flex justify-end gap-2">
                            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-md border border-white/20 hover:bg-white/10">Cancelar</button>
                            <button type="button" onClick={handleProcess} className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700">Analisar Lista</button>
                        </div>
                    </>
                )}
                {step === 2 && (
                    <>
                        <h2 className="text-lg font-bold mb-4">Revisar Alterações</h2>
                         {noChanges ? (
                            <div className="text-center py-10">
                                <svg className="mx-auto h-12 w-12 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <h3 className="mt-4 text-lg font-medium text-white">Tudo Sincronizado!</h3>
                                <p className="mt-2 text-sm text-gray-300">Nenhuma alteração é necessária. A lista importada corresponde aos dados atuais.</p>
                                <div className="mt-6 flex justify-end">
                                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700">Fechar</button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <p className="text-sm text-gray-300 mb-4">Confirme as alterações abaixo. Elas serão aplicadas diretamente na sua planilha.</p>
                                <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
                                   {additions.length > 0 && <div>
                                        <h3 className="font-semibold text-green-400">EXECUTIVOS A ADICIONAR ({additions.length})</h3>
                                        <ul className="mt-2 text-sm space-y-2">
                                            {additions.map((exec, i) => <li key={i} className="p-2 bg-green-900/40 rounded-md grid grid-cols-3 gap-4 items-center">
                                               <div><strong>{exec.nickname}</strong></div>
                                               <div>{exec.specialization}</div>
                                               <input type="date" value={exec.concessionDate} onChange={e => handleDateChange(i, e.target.value, 'add')} required className="w-full text-sm rounded-md shadow-sm"/>
                                            </li>)}
                                        </ul>
                                    </div>}
                                    {updates.length > 0 && <div>
                                        <h3 className="font-semibold text-yellow-400">EXECUTIVOS A ALTERAR ({updates.length})</h3>
                                         <ul className="mt-2 text-sm space-y-2">
                                            {updates.map(({executive, changes}, i) => {
                                                const finalDate = changes.concessionDate !== undefined ? changes.concessionDate : executive.concessionDate;
                                                return (
                                                <li key={executive.id} className="p-2 bg-yellow-900/40 rounded-md">
                                                   <strong>{executive.nickname}</strong>
                                                   <div className="pl-4 text-xs">
                                                       {changes.specialization && <div>Especialização: {executive.specialization} → <strong>{changes.specialization}</strong></div>}
                                                       {changes.status && <div>Status: {executive.status} → <strong>{changes.status}</strong></div>}
                                                       {changes.concessionDate && <div>Data: {formatDisplayDate(executive.concessionDate)} → <strong>{formatDisplayDate(changes.concessionDate)}</strong></div>}
                                                       {!changes.concessionDate && <input type="date" value={finalDate} onChange={e => handleDateChange(i, e.target.value, 'update')} required className="hidden"/>}
                                                   </div>
                                                </li>
                                                )
                                            })}
                                        </ul>
                                    </div>}
                                     {removals.length > 0 && <div>
                                        <h3 className="font-semibold text-red-400">EXECUTIVOS A REMOVER ({removals.length})</h3>
                                        <ul className="mt-2 text-sm grid grid-cols-3 gap-2">
                                            {removals.map(exec => <li key={exec.id} className="p-1 bg-red-900/40 rounded truncate" title={exec.nickname}>
                                               <span className="line-through">{exec.nickname}</span>
                                            </li>)}
                                        </ul>
                                    </div>}
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
                                                Atenção: Após confirmar, importe a lista novamente para garantir que todas as alterações foram processadas e que o quadro está 100% sincronizado.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6 flex justify-end gap-2">
                                     <button type="button" onClick={() => setStep(1)} disabled={isLoading} className="px-4 py-2 text-sm font-medium rounded-md border border-white/20 hover:bg-white/10 disabled:opacity-50">Voltar</button>
                                    <button type="button" onClick={handleConfirm} disabled={isLoading} className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50">
                                        {isLoading && <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                                        {isLoading ? 'Atualizando...' : 'Confirmar e Atualizar'}
                                    </button>
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

// Fix: Define the SpecializationManagerProps interface.
interface SpecializationManagerProps {
  executives: Executive[];
  onUpdate: (action: string, payload: any) => Promise<void>;
}

const SpecializationManager: React.FC<SpecializationManagerProps> = ({ executives, onUpdate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [currentExecutive, setCurrentExecutive] = useState<Executive | null>(null);

  const handleOpenModal = (executive: Executive | null = null) => {
    setCurrentExecutive(executive);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentExecutive(null);
  };

  const handleSave = (executiveData: Omit<Executive, 'id' | 'status'>) => {
    if (currentExecutive) {
      onUpdate('UPDATE_EXECUTIVE', { ...currentExecutive, ...executiveData });
    } else {
      onUpdate('ADD_EXECUTIVE', executiveData);
    }
    handleCloseModal();
  };
  
  const toggleStatus = (executive: Executive) => {
    if (executive.status === 'licença') {
      alert("O status de 'Licença' é gerenciado apenas pela importação da lista.");
      return;
    }
    const newStatus = executive.status === 'ativo' ? 'inativo' : 'ativo';
    onUpdate('UPDATE_EXECUTIVE', { ...executive, status: newStatus });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-white">Quadro de Especializações</h1>
          <p className="mt-2 text-sm text-gray-300">
            Gerencie os executivos e suas especializações.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none flex items-center gap-2">
           <button
            onClick={() => setIsImportModalOpen(true)}
            type="button"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:w-auto transition-colors duration-300"
          >
            Importar Lista
          </button>
          <button
            onClick={() => handleOpenModal()}
            type="button"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary-500/80 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:w-auto transition-colors duration-300"
          >
            Adicionar Executivo
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
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">Especialização</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">Data de Concessão</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">Status</th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Ações</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800 bg-transparent">
                  {executives.map((executive) => (
                    <tr key={executive.id} className="hover:bg-white/5 transition-colors duration-200">
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-6">{executive.nickname}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">{executive.specialization}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">{formatDisplayDate(executive.concessionDate)}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                         <span onClick={() => toggleStatus(executive)} className={`cursor-pointer px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            executive.status === 'ativo' ? 'bg-green-900 text-green-200' :
                            executive.status === 'licença' ? 'bg-yellow-900 text-yellow-200' :
                           'bg-red-900 text-red-200'
                         }`}>
                           {executive.status.charAt(0).toUpperCase() + executive.status.slice(1)}
                         </span>
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 space-x-2">
                        <button onClick={() => handleOpenModal(executive)} className="text-primary-400 hover:text-primary-200">Editar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {isModalOpen && <ExecutiveModal executive={currentExecutive} onSave={handleSave} onClose={handleCloseModal} />}
      {isImportModalOpen && <ImportModal executives={executives} onUpdate={onUpdate} onClose={() => setIsImportModalOpen(false)} />}
    </div>
  );
};

// Modal Component defined inside the same file for simplicity, but could be moved
const ExecutiveModal: React.FC<{
    executive: Executive | null;
    onSave: (data: Omit<Executive, 'id' | 'status'>) => void;
    onClose: () => void;
}> = ({ executive, onSave, onClose }) => {
    const [nickname, setNickname] = useState(executive?.nickname || '');
    const [specialization, setSpecialization] = useState(executive?.specialization || SpecializationLevel.INTERMEDIARIA);
    const [concessionDate, setConcessionDate] = useState(executive?.concessionDate || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!nickname || !concessionDate) return;
        onSave({ nickname, specialization, concessionDate });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center glass-modal-container">
            <div className="glass-modal rounded-lg shadow-xl p-6 w-full max-w-md">
                <h2 className="text-lg font-bold mb-4">{executive ? 'Editar Executivo' : 'Adicionar Executivo'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="nickname" className="block text-sm font-medium text-gray-300">Nickname</label>
                            <input type="text" id="nickname" value={nickname} onChange={e => setNickname(e.target.value)} required className="mt-1 block w-full rounded-md shadow-sm sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="specialization" className="block text-sm font-medium text-gray-300">Especialização</label>
                            <select id="specialization" value={specialization} onChange={e => setSpecialization(e.target.value as SpecializationLevel)} className="mt-1 block w-full rounded-md shadow-sm sm:text-sm">
                                {Object.values(SpecializationLevel).map(level => (
                                    <option key={level} value={level}>{level}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="concessionDate" className="block text-sm font-medium text-gray-300">Data de Concessão</label>
                            <input type="date" id="concessionDate" value={concessionDate} onChange={e => setConcessionDate(e.target.value)} required className="mt-1 block w-full rounded-md shadow-sm sm:text-sm" />
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

export default SpecializationManager;
