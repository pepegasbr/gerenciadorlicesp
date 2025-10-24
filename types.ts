export enum SpecializationLevel {
  INTERMEDIARIA = 'Intermediária',
  AVANCADA = 'Avançada',
}

export interface Executive {
  id: string;
  nickname: string;
  specialization: SpecializationLevel;
  concessionDate: string; // YYYY-MM-DD
  status: 'ativo' | 'inativo' | 'licença';
}

export interface License {
  id: string;
  executiveNickname: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  returnDate?: string | null; // YYYY-MM-DD
}

export type AppView = 'specializations' | 'licenses' | 'generator' | 'loading' | 'backup' | 'manual';