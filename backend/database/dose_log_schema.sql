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
