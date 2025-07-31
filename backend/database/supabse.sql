-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.history (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  profile_id uuid NOT NULL,
  nama_obat text NOT NULL,
  dosis_obat integer NOT NULL,
  sisa_obat integer NOT NULL,
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
  CONSTRAINT jadwal_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profile(id),
  CONSTRAINT jadwal_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
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
  CONSTRAINT kontrol_pkey PRIMARY KEY (id),
  CONSTRAINT kontrol_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT kontrol_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profile(id)
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

CREATE TABLE public.notes (
  note_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  profile_id uuid NOT NULL,
  category text NOT NULL,         -- contoh: 'kontrol', 'pengingat', 'lainnya'
  message text NOT NULL,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),

  CONSTRAINT fk_notes_user
    FOREIGN KEY (user_id) REFERENCES auth.users(id),

  CONSTRAINT fk_notes_profile
    FOREIGN KEY (profile_id) REFERENCES public.profile(id)
);
