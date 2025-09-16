-- Migration to add family_members table

-- Create family_members table
CREATE TABLE IF NOT EXISTS public.family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  relationship TEXT,
  student_id UUID REFERENCES public.estudantes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_family_members_student_id ON public.family_members(student_id);
CREATE INDEX IF NOT EXISTS idx_family_members_created_at ON public.family_members(created_at);

-- Add RLS (Row Level Security)
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Family members are viewable by authenticated users" 
ON public.family_members FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Family members can be created by authenticated users" 
ON public.family_members FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Family members can be updated by authenticated users" 
ON public.family_members FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "Family members can be deleted by authenticated users" 
ON public.family_members FOR DELETE 
TO authenticated 
USING (true);

-- Add comment for documentation
COMMENT ON TABLE public.family_members IS 'Family members associated with students for relationship management';

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