-- Query untuk update tabel jadwal_wa_reminders ke format array

-- 1. Backup existing data (optional)
CREATE TABLE jadwal_wa_reminders_backup AS 
SELECT * FROM public.jadwal_wa_reminders;

-- 2. Drop existing table
DROP TABLE IF EXISTS public.jadwal_wa_reminders;

-- 3. Create new table with array format
CREATE TABLE public.jadwal_wa_reminders (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  jadwal_id uuid NOT NULL,
  user_id uuid NOT NULL,
  jam_reminders text[] NOT NULL,        -- Array jam: ["08:00", "12:00", "16:00", "20:00"]
  wablas_reminder_ids text[] NOT NULL,  -- Array IDs: ["id1", "id2", "id3", "id4"]
  is_active boolean DEFAULT true,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),

  CONSTRAINT fk_jadwal_wa_reminders_jadwal
    FOREIGN KEY (jadwal_id) REFERENCES public.jadwal(id) ON DELETE CASCADE,

  CONSTRAINT fk_jadwal_wa_reminders_user
    FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_jadwal_wa_reminders_jadwal_id 
    ON public.jadwal_wa_reminders(jadwal_id);

CREATE INDEX IF NOT EXISTS idx_jadwal_wa_reminders_user_id 
    ON public.jadwal_wa_reminders(user_id);

CREATE INDEX IF NOT EXISTS idx_jadwal_wa_reminders_active 
    ON public.jadwal_wa_reminders(is_active);

-- 5. Enable RLS
ALTER TABLE public.jadwal_wa_reminders ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies
CREATE POLICY "Users can view their own wa reminders" ON public.jadwal_wa_reminders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wa reminders" ON public.jadwal_wa_reminders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wa reminders" ON public.jadwal_wa_reminders
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wa reminders" ON public.jadwal_wa_reminders
    FOR DELETE USING (auth.uid() = user_id);

-- 7. Grant permissions
GRANT ALL ON public.jadwal_wa_reminders TO authenticated;
GRANT ALL ON public.jadwal_wa_reminders TO service_role;
