-- Fix family member functionality - create missing database tables
-- This resolves build errors with useFamilyMembers hook

-- Create family_members table
CREATE TABLE IF NOT EXISTS public.family_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    gender CHAR(1) CHECK (gender IN ('M', 'F')),
    relation TEXT CHECK (relation IN ('Pai', 'Mãe', 'Cônjuge', 'Filho', 'Filha', 'Irmão', 'Irmã')),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create invitations_log table
CREATE TABLE IF NOT EXISTS public.invitations_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_member_id UUID NOT NULL REFERENCES public.family_members(id) ON DELETE CASCADE,
    method TEXT CHECK (method IN ('EMAIL', 'WHATSAPP')),
    status TEXT CHECK (status IN ('PENDING', 'SENT', 'ACCEPTED', 'EXPIRED')) DEFAULT 'PENDING',
    sent_by UUID REFERENCES auth.users(id),
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for family_members
CREATE POLICY "Users can manage their own family members"
ON public.family_members
FOR ALL
USING (auth.uid() = created_by);

-- RLS Policies for invitations_log  
CREATE POLICY "Users can manage their own invitation logs"
ON public.invitations_log
FOR ALL
USING (auth.uid() = sent_by);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_family_members_student_id ON public.family_members(student_id);
CREATE INDEX IF NOT EXISTS idx_family_members_created_by ON public.family_members(created_by);
CREATE INDEX IF NOT EXISTS idx_invitations_log_family_member_id ON public.invitations_log(family_member_id);
CREATE INDEX IF NOT EXISTS idx_invitations_log_sent_by ON public.invitations_log(sent_by);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_family_members_updated_at
    BEFORE UPDATE ON public.family_members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();