-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.history (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  profile_id uuid NOT NULL,
  nama_obat text NOT NULL,
  dosis_obat text NOT NULL,
  sisa_obat text NOT NULL,
  status text NOT NULL,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  waktu_minum ARRAY,
  CONSTRAINT history_pkey PRIMARY KEY (id),
  CONSTRAINT history_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT history_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profile(id)
);
CREATE TABLE public.jadwal (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  profile_id uuid NOT NULL,
  nama_obat text NOT NULL,
  dosis_obat integer NOT NULL,
  jumlah_obat integer NOT NULL,
  catatan text,
  kategori text,
  slot_obat text,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  nama_pasien text,
  jam_awal ARRAY,
  jam_berakhir ARRAY,
  CONSTRAINT jadwal_pkey PRIMARY KEY (id),
  CONSTRAINT jadwal_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT jadwal_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profile(id)
);
CREATE TABLE public.jadwal_wa_reminders (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  jadwal_id uuid NOT NULL,
  user_id uuid NOT NULL,
  jam_reminders ARRAY NOT NULL,
  wablas_reminder_ids ARRAY NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT jadwal_wa_reminders_pkey PRIMARY KEY (id),
  CONSTRAINT fk_jadwal_wa_reminders_jadwal FOREIGN KEY (jadwal_id) REFERENCES public.jadwal(id),
  CONSTRAINT fk_jadwal_wa_reminders_user FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.kontrol (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  profile_id uuid NOT NULL,
  tanggal date NOT NULL,
  dokter text NOT NULL,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  waktu text,
  isDone boolean NOT NULL DEFAULT false,
  nama_pasien text,
  wablas_schedule_id ARRAY,
  CONSTRAINT kontrol_pkey PRIMARY KEY (id),
  CONSTRAINT kontrol_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT kontrol_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profile(id)
);
CREATE TABLE public.kontrol_wa_reminders (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  kontrol_id uuid NOT NULL,
  user_id uuid NOT NULL,
  reminder_types ARRAY NOT NULL,
  reminder_times ARRAY NOT NULL,
  wablas_schedule_ids ARRAY NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT kontrol_wa_reminders_pkey PRIMARY KEY (id),
  CONSTRAINT fk_kontrol_wa_reminders_kontrol FOREIGN KEY (kontrol_id) REFERENCES public.kontrol(id),
  CONSTRAINT fk_kontrol_wa_reminders_user FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.notes (
  note_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  profile_id uuid NOT NULL,
  category text NOT NULL,
  message text NOT NULL,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT notes_pkey PRIMARY KEY (note_id),
  CONSTRAINT fk_notes_user FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT fk_notes_profile FOREIGN KEY (profile_id) REFERENCES public.profile(id)
);
CREATE TABLE public.peringatan (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  profile_id uuid NOT NULL,
  nama_obat text NOT NULL,
  slot_obat text NOT NULL,
  pesan text NOT NULL,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT peringatan_pkey PRIMARY KEY (id),
  CONSTRAINT peringatan_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT peringatan_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profile(id)
);
CREATE TABLE public.profile (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  username text NOT NULL,
  email text NOT NULL UNIQUE,
  no_hp text,
  img_profile text,
  is_verified boolean DEFAULT false,
  fcm_token text,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT profile_pkey PRIMARY KEY (id),
  CONSTRAINT profile_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- Schema for dose logging (Approach A)
create table if not exists public.jadwal_dose_log (
  id uuid primary key default uuid_generate_v4(),
  jadwal_id uuid not null references public.jadwal(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  date_for date not null,
  dose_time text not null,
  status text not null check (status in ('pending','taken','missed')),
  taken_at timestamptz,
  source text default 'iot',
  created_at timestamp without time zone default now(),
  updated_at timestamp without time zone default now(),
  unique (jadwal_id, date_for, dose_time)
);

create index if not exists idx_jdl_user_date on public.jadwal_dose_log (user_id, date_for);
create index if not exists idx_jdl_jadwal_date on public.jadwal_dose_log (jadwal_id, date_for);

-- Optional view to read today's status
create or replace view public.jadwal_status_today as
select
  j.id as jadwal_id,
  j.user_id,
  j.nama_obat,
  j.nama_pasien,
  x.jam as dose_time,
  coalesce(d.status, 'pending') as status,
  d.taken_at
from public.jadwal j
join lateral unnest(j.jam_awal)::text as x(jam) on true
left join public.jadwal_dose_log d
  on d.jadwal_id = j.id
 and d.user_id   = j.user_id
 and d.date_for  = now()::date
 and d.dose_time = x.jam
order by j.id, (x.jam)::time;
