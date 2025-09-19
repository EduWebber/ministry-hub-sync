// Simplified family types for system harmonization
export type Gender = 'M' | 'F';
export type Relation = 'Pai' | 'Mãe' | 'Cônjuge' | 'Filho' | 'Filha' | 'Irmão' | 'Irmã';
export type InvitationStatus = 'PENDING' | 'SENT' | 'ACCEPTED' | 'EXPIRED';
export type InviteMethod = 'EMAIL' | 'WHATSAPP';

// Form types
export interface FamilyMemberFormData {
  name: string;
  email?: string;
  phone?: string;
  gender: Gender;
  relation: Relation;
}

// Display types - simplified for harmonization
export interface FamilyMemberWithInvitations {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  gender: Gender;
  relation: Relation;
  invitation_status: InvitationStatus;
  can_invite: boolean;
  student_id: string;
  created_at?: string;
  created_by?: string;
  updated_at?: string;
}

// Safe parsers for DB -> union types
export function parseGender(value: string): Gender {
  return value === 'M' || value === 'F' ? value : 'M';
}

export function parseRelation(value: string): Relation {
  const valid: Relation[] = ['Pai', 'Mãe', 'Cônjuge', 'Filho', 'Filha', 'Irmão', 'Irmã'];
  return valid.includes(value as Relation) ? (value as Relation) : 'Filho';
}

export function parseInvitationStatus(value: string): InvitationStatus {
  const valid: InvitationStatus[] = ['PENDING', 'SENT', 'ACCEPTED', 'EXPIRED'];
  return valid.includes(value as InvitationStatus) ? (value as InvitationStatus) : 'PENDING';
}

// Simplified family relationship detection for assignment system
export const getFamilyRelationship = async (
  student1Id: string,
  student2Id: string
): Promise<Relation | null> => {
  // Simplified implementation: always return null for now
  // This will be enhanced during system harmonization
  console.log('Family relationship check simplified during harmonization');
  return null;
};

// Simplified pairing check for assignments
export const canBePaired = async (
  student1: { id: string; gender: 'M' | 'F'; age?: number },
  student2: { id: string; gender: 'M' | 'F'; age?: number }
): Promise<boolean> => {
  // Same gender pairs are always allowed
  if (student1.gender === student2.gender) {
    return true;
  }
  
  // Different gender pairs: simplified to not allow for now
  // This will be enhanced with proper family relationship checking
  return false;
};