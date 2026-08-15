-- ==============================================================================
-- MUSLIM COMMUNITY CENTER OF WNY (MCCWNY) - ADMIN PORTAL SUPABASE SCHEMA & RLS
-- ==============================================================================

-- 1. TYPE DEFINITIONS (Safe / Idempotent)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_type') THEN
        CREATE TYPE transaction_type AS ENUM (
          'member_fee',
          'class_payment',
          'general_donation',
          'expense'
        );
    END IF;
END $$;

-- 2. TABLE DEFINITIONS

-- Members Table
CREATE TABLE IF NOT EXISTS public.members (
  id TEXT PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Students Table
CREATE TABLE IF NOT EXISTS public.students (
  id TEXT PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  parent_name TEXT NOT NULL,
  phone_number TEXT,
  address TEXT,
  grade_level TEXT,
  member_parent_id TEXT REFERENCES public.members(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Transactions Table
CREATE TABLE IF NOT EXISTS public.transactions (
  id TEXT PRIMARY KEY,
  type transaction_type NOT NULL,
  amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT,
  member_id TEXT REFERENCES public.members(id) ON DELETE SET NULL,
  student_id TEXT REFERENCES public.students(id) ON DELETE SET NULL,
  payment_method TEXT NOT NULL,
  is_reconciled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_students_member_parent ON public.students(member_parent_id);
CREATE INDEX IF NOT EXISTS idx_transactions_member ON public.transactions(member_id);
CREATE INDEX IF NOT EXISTS idx_transactions_student ON public.transactions(student_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(date);

-- 4. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Clear any existing policies
DROP POLICY IF EXISTS "Allow full access to members" ON public.members;
DROP POLICY IF EXISTS "Allow full access to students" ON public.students;
DROP POLICY IF EXISTS "Allow full access to transactions" ON public.transactions;

-- RLS Policies for Members
CREATE POLICY "Allow full access to members"
  ON public.members FOR ALL
  USING (true) WITH CHECK (true);

-- RLS Policies for Students
CREATE POLICY "Allow full access to students"
  ON public.students FOR ALL
  USING (true) WITH CHECK (true);

-- RLS Policies for Transactions
CREATE POLICY "Allow full access to transactions"
  ON public.transactions FOR ALL
  USING (true) WITH CHECK (true);
