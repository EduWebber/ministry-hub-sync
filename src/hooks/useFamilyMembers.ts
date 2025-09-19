import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  FamilyMemberFormData,
  FamilyMemberWithInvitations,
  InviteMethod,
  InvitationStatus,
  parseGender,
  parseRelation,
  parseInvitationStatus
} from '@/types/family';

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

      // Fetch family members with their latest invitation
      const { data: familyData, error: familyError } = await supabase
        .from('family_members')
        .select(`
          *,
          latest_invitation:invitations_log(*)
        `)
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

      if (familyError) {
        throw new Error(`Failed to fetch family members: ${familyError.message}`);
      }

      // Transform the data to match our interface
      const transformedMembers: FamilyMemberWithInvitations[] = (familyData || []).map(member => ({
        ...member,
        gender: parseGender(member.gender || 'M'),
        relation: parseRelation(member.relation || 'Filho'),
        invitation_status: member.latest_invitation 
          ? parseInvitationStatus(member.latest_invitation.status || 'PENDING')
          : 'PENDING' as InvitationStatus,
        can_invite: !!(member.email || member.phone),
        latest_invitation: member.latest_invitation || undefined
      }));

      setFamilyMembers(transformedMembers);
    } catch (err) {
      console.error('Error fetching family members:', err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  }, [studentId]);

  const addFamilyMember = useCallback(async (data: FamilyMemberFormData) => {
    if (!studentId || !user) {
      throw new Error('Student ID and user are required');
    }

    try {
      setIsAdding(true);
      setError(null);

      const { error: insertError } = await supabase
        .from('family_members')
        .insert({
          student_id: studentId,
          name: data.name,
          email: data.email || null,
          phone: data.phone || null,
          gender: data.gender,
          relation: data.relation,
          created_by: user.id
        });

      if (insertError) {
        throw new Error(`Failed to add family member: ${insertError.message}`);
      }

      // Refresh the list
      await fetchFamilyMembers();
    } catch (err) {
      console.error('Error adding family member:', err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      throw err;
    } finally {
      setIsAdding(false);
    }
  }, [studentId, user, fetchFamilyMembers]);

  const updateFamilyMember = useCallback(async (id: string, data: FamilyMemberFormData) => {
    if (!user) {
      throw new Error('User is required');
    }

    try {
      setIsUpdating(true);
      setError(null);

      const { error: updateError } = await supabase
        .from('family_members')
        .update({
          name: data.name,
          email: data.email || null,
          phone: data.phone || null,
          gender: data.gender,
          relation: data.relation,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (updateError) {
        throw new Error(`Failed to update family member: ${updateError.message}`);
      }

      // Refresh the list
      await fetchFamilyMembers();
    } catch (err) {
      console.error('Error updating family member:', err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      throw err;
    } finally {
      setIsUpdating(false);
    }
  }, [user, fetchFamilyMembers]);

  const deleteFamilyMember = useCallback(async (id: string) => {
    try {
      setIsDeleting(true);
      setError(null);

      const { error: deleteError } = await supabase
        .from('family_members')
        .delete()
        .eq('id', id);

      if (deleteError) {
        throw new Error(`Failed to delete family member: ${deleteError.message}`);
      }

      // Refresh the list
      await fetchFamilyMembers();
    } catch (err) {
      console.error('Error deleting family member:', err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      throw err;
    } finally {
      setIsDeleting(false);
    }
  }, [fetchFamilyMembers]);

  const sendInvitation = useCallback(async (familyMemberId: string, method: InviteMethod) => {
    if (!user) {
      throw new Error('User is required');
    }

    try {
      setIsSendingInvitation(true);
      setError(null);

      // Find the family member
      const familyMember = familyMembers.find(fm => fm.id === familyMemberId);
      if (!familyMember) {
        throw new Error('Family member not found');
      }

      // Validate contact method
      if (method === 'EMAIL' && !familyMember.email) {
        throw new Error('Email address is required for email invitations');
      }
      if (method === 'WHATSAPP' && !familyMember.phone) {
        throw new Error('Phone number is required for WhatsApp invitations');
      }

      // Log the invitation attempt
      const { error: logError } = await supabase
        .from('invitations_log')
        .insert({
          family_member_id: familyMemberId,
          method,
          status: 'SENT',
          sent_by: user.id,
          sent_at: new Date().toISOString()
        });

      if (logError) {
        throw new Error(`Failed to log invitation: ${logError.message}`);
      }

      // In a real implementation, you would integrate with email/SMS services here
      // For now, we'll just simulate the invitation being sent
      console.log(`Invitation sent via ${method} to ${familyMember.name}`);

      // Refresh the list to show updated invitation status
      await fetchFamilyMembers();
    } catch (err) {
      console.error('Error sending invitation:', err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      throw err;
    } finally {
      setIsSendingInvitation(false);
    }
  }, [user, familyMembers, fetchFamilyMembers]);

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