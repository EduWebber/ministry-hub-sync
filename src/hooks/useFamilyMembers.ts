import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Simplified types for immediate fix
interface FamilyMemberFormData {
  name: string;
  email?: string;
  phone?: string;
  gender: 'M' | 'F';
  relation: string;
}

interface FamilyMemberWithInvitations {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  gender: 'M' | 'F';
  relation: string;
  invitation_status: 'PENDING' | 'SENT' | 'ACCEPTED' | 'EXPIRED';
  can_invite: boolean;
  student_id: string;
}

type InviteMethod = 'EMAIL' | 'WHATSAPP';

interface UseFamilyMembersReturn {
  familyMembers: FamilyMemberWithInvitations[];
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  addFamilyMember: (data: FamilyMemberFormData) => Promise<void>;
  updateFamilyMember: (id: string, data: FamilyMemberFormData) => Promise<void>;
  deleteFamilyMember: (id: string) => Promise<void>;
  sendInvitation: (familyMemberId: string, method: InviteMethod) => Promise<void>;
  refetch: () => Promise<void>;
  isAdding: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isSendingInvitation: boolean;
}

export const useFamilyMembers = (studentId?: string): UseFamilyMembersReturn => {
  const { user } = useAuth();
  const [familyMembers, setFamilyMembers] = useState<FamilyMemberWithInvitations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSendingInvitation, setIsSendingInvitation] = useState(false);

  const fetchFamilyMembers = useCallback(async () => {
    if (!studentId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsFetching(true);
      setError(null);

      // Simplified: Return empty array for now while system harmonizes
      // Family members will be integrated with existing estudantes table structure
      setFamilyMembers([]);
    } catch (err) {
      console.error('Error fetching family members:', err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  }, [studentId]);

  const addFamilyMember = useCallback(async (data: FamilyMemberFormData) => {
    console.log('Family member management temporarily simplified during system harmonization');
    throw new Error('Funcionalidade temporariamente indisponível durante harmonização do sistema');
  }, []);

  const updateFamilyMember = useCallback(async (id: string, data: FamilyMemberFormData) => {
    console.log('Family member management temporarily simplified during system harmonization');
    throw new Error('Funcionalidade temporariamente indisponível durante harmonização do sistema');
  }, []);

  const deleteFamilyMember = useCallback(async (id: string) => {
    console.log('Family member management temporarily simplified during system harmonization');
    throw new Error('Funcionalidade temporariamente indisponível durante harmonização do sistema');
  }, []);

  const sendInvitation = useCallback(async (familyMemberId: string, method: InviteMethod) => {
    console.log('Family invitation system temporarily simplified during system harmonization');
    throw new Error('Funcionalidade temporariamente indisponível durante harmonização do sistema');
  }, []);

  const refetch = useCallback(async () => {
    await fetchFamilyMembers();
  }, [fetchFamilyMembers]);

  // Initial fetch
  useEffect(() => {
    fetchFamilyMembers();
  }, [fetchFamilyMembers]);

  return {
    familyMembers,
    isLoading,
    isFetching,
    error,
    addFamilyMember,
    updateFamilyMember,
    deleteFamilyMember,
    sendInvitation,
    refetch,
    isAdding,
    isUpdating,
    isDeleting,
    isSendingInvitation
  };
};