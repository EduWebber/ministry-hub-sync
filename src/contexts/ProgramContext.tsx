import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ProgramContextType {
  // Congregação selecionada
  selectedCongregacaoId: string | null;
  setSelectedCongregacaoId: (id: string | null) => void;
  
  // Programa selecionado
  selectedProgramId: string | null;
  setSelectedProgramId: (id: string | null) => void;
  
  // Semana selecionada
  selectedWeekStart: string | null;
  setSelectedWeekStart: (date: string | null) => void;
  
  // Funções para limpar contexto
  clearContext: () => void;
}

const ProgramContext = createContext<ProgramContextType | undefined>(undefined);

export function ProgramProvider({ children }: { children: ReactNode }) {
  const [selectedCongregacaoId, setSelectedCongregacaoId] = useState<string | null>(null);
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const [selectedWeekStart, setSelectedWeekStart] = useState<string | null>(null);

  // Carregar contexto do localStorage ao iniciar
  useEffect(() => {
    const savedCongregacaoId = localStorage.getItem('selectedCongregacaoId');
    const savedProgramId = localStorage.getItem('selectedProgramId');
    const savedWeekStart = localStorage.getItem('selectedWeekStart');
    
    if (savedCongregacaoId) setSelectedCongregacaoId(savedCongregacaoId);
    if (savedProgramId) setSelectedProgramId(savedProgramId);
    if (savedWeekStart) setSelectedWeekStart(savedWeekStart);
  }, []);

  // Salvar contexto no localStorage quando mudar
  useEffect(() => {
    if (selectedCongregacaoId) {
      localStorage.setItem('selectedCongregacaoId', selectedCongregacaoId);
    } else {
      localStorage.removeItem('selectedCongregacaoId');
    }
  }, [selectedCongregacaoId]);

  useEffect(() => {
    if (selectedProgramId) {
      localStorage.setItem('selectedProgramId', selectedProgramId);
    } else {
      localStorage.removeItem('selectedProgramId');
    }
  }, [selectedProgramId]);

  useEffect(() => {
    if (selectedWeekStart) {
      localStorage.setItem('selectedWeekStart', selectedWeekStart);
    } else {
      localStorage.removeItem('selectedWeekStart');
    }
  }, [selectedWeekStart]);

  const clearContext = () => {
    setSelectedCongregacaoId(null);
    setSelectedProgramId(null);
    setSelectedWeekStart(null);
    localStorage.removeItem('selectedCongregacaoId');
    localStorage.removeItem('selectedProgramId');
    localStorage.removeItem('selectedWeekStart');
  };

  const contextValue: ProgramContextType = {
    selectedCongregacaoId,
    setSelectedCongregacaoId,
    selectedProgramId,
    setSelectedProgramId,
    selectedWeekStart,
    setSelectedWeekStart,
    clearContext
  };

  return (
    <ProgramContext.Provider value={contextValue}>
      {children}
    </ProgramContext.Provider>
  );
}

export function useProgramContext() {
  const context = useContext(ProgramContext);
  if (context === undefined) {
    throw new Error('useProgramContext must be used within a ProgramProvider');
  }
  return context;
}