-- Site-wide JSON configs keyed by a short string
create table if not exists public.site_configs (
  key text primary key,
  content jsonb not null,
  updated_at timestamptz not null default now()
);

-- Allow anon read; write via admin UI (RLS checks can be tightened later)
alter table public.site_configs enable row level security;

create policy "site_configs_read"
  on public.site_configs for select
  using (true);

-- For now allow upsert to anyone with service role (edge/admin). If you want to restrict to authenticated admins only, adjust later.
create policy "site_configs_write_authenticated"
  on public.site_configs for insert
  to authenticated
  with check (true);

create policy "site_configs_update_authenticated"
  on public.site_configs for update
  to authenticated
  using (true)
  with check (true);

