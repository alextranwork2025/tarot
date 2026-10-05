do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public' and t.typname = 'bracelet_availability'
  ) then
    create type public.bracelet_availability as enum ('available', 'made_to_order', 'out_of_stock');
  end if;
end $$;

create sequence if not exists public.bracelet_product_code_seq as integer start 1;

create table public.bracelets (
  id uuid primary key default gen_random_uuid(),
  product_code text not null unique default ('VT-' || lpad(nextval('public.bracelet_product_code_seq')::text, 6, '0')),
  name text not null,
  slug text not null unique,
  featured_image text not null,
  short_description text not null,
  content text not null,
  bead_sizes_mm numeric(5, 1)[] not null default '{}',
  wrist_sizes_cm text[] not null default '{}',
  gallery text[] not null default '{}',
  colors text[] not null default '{}',
  style text,
  bead_count text,
  cord_material text,
  accessory_material text,
  price numeric(12, 0),
  availability public.bracelet_availability not null default 'available',
  meaning text,
  suitable_elements text[] not null default '{}',
  wrist_measurement_guide text,
  care_guide text,
  policy text,
  origin text,
  treatment text,
  certification text,
  is_featured boolean not null default false,
  display_order integer not null default 0,
  status public.stone_content_status not null default 'draft',
  seo_title text,
  seo_description text,
  published_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint bracelets_name_length check (char_length(trim(name)) between 2 and 160),
  constraint bracelets_product_code_length check (char_length(trim(product_code)) between 2 and 40),
  constraint bracelets_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' and char_length(slug) <= 180),
  constraint bracelets_required_text_length check (
    char_length(short_description) <= 420 and char_length(content) <= 60000
  ),
  constraint bracelets_featured_image_length check (char_length(featured_image) <= 2048),
  constraint bracelets_gallery_size check (cardinality(gallery) <= 20),
  constraint bracelets_list_size check (
    cardinality(bead_sizes_mm) between 1 and 20
    and cardinality(wrist_sizes_cm) between 1 and 20
    and cardinality(colors) <= 20
    and cardinality(suitable_elements) <= 10
  ),
  constraint bracelets_text_fields_length check (
    (style is null or char_length(style) <= 120)
    and (bead_count is null or char_length(bead_count) <= 80)
    and (cord_material is null or char_length(cord_material) <= 160)
    and (accessory_material is null or char_length(accessory_material) <= 160)
    and (meaning is null or char_length(meaning) <= 12000)
    and (wrist_measurement_guide is null or char_length(wrist_measurement_guide) <= 10000)
    and (care_guide is null or char_length(care_guide) <= 10000)
    and (policy is null or char_length(policy) <= 10000)
    and (origin is null or char_length(origin) <= 2000)
    and (treatment is null or char_length(treatment) <= 2000)
    and (certification is null or char_length(certification) <= 2000)
  ),
  constraint bracelets_price_nonnegative check (price is null or price >= 0),
  constraint bracelets_display_order_nonnegative check (display_order >= 0),
  constraint bracelets_seo_length check (
    (seo_title is null or char_length(seo_title) <= 160)
    and (seo_description is null or char_length(seo_description) <= 320)
  )
);

create table public.bracelet_stones (
  id uuid primary key default gen_random_uuid(),
  bracelet_id uuid not null references public.bracelets(id) on delete cascade,
  stone_id uuid not null references public.stones(id) on delete restrict,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  constraint bracelet_stones_unique unique (bracelet_id, stone_id),
  constraint bracelet_stones_display_order_nonnegative check (display_order >= 0)
);

create table public.site_contact_settings (
  id smallint primary key default 1,
  zalo_url text,
  facebook_url text,
  updated_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now(),
  constraint site_contact_settings_singleton check (id = 1),
  constraint site_contact_settings_url_length check (
    (zalo_url is null or char_length(zalo_url) <= 2048)
    and (facebook_url is null or char_length(facebook_url) <= 2048)
  )
);

insert into public.site_contact_settings (id) values (1)
on conflict (id) do nothing;

create index bracelets_status_idx on public.bracelets(status);
create index bracelets_published_at_idx on public.bracelets(published_at desc) where deleted_at is null;
create index bracelets_featured_idx on public.bracelets(is_featured, display_order) where deleted_at is null;
create index bracelets_availability_idx on public.bracelets(availability);
create index bracelets_bead_sizes_gin_idx on public.bracelets using gin(bead_sizes_mm);
create index bracelets_created_by_idx on public.bracelets(created_by);
create index bracelet_stones_bracelet_idx on public.bracelet_stones(bracelet_id, display_order);
create index bracelet_stones_stone_idx on public.bracelet_stones(stone_id);

drop trigger if exists bracelets_set_updated_at on public.bracelets;
create trigger bracelets_set_updated_at
before update on public.bracelets
for each row execute function private.set_updated_at();

drop trigger if exists site_contact_settings_set_updated_at on public.site_contact_settings;
create trigger site_contact_settings_set_updated_at
before update on public.site_contact_settings
for each row execute function private.set_updated_at();

alter table public.bracelets enable row level security;
alter table public.bracelet_stones enable row level security;
alter table public.site_contact_settings enable row level security;

create policy bracelets_public_select_published on public.bracelets
for select to anon, authenticated
using (status = 'published' and published_at is not null and published_at <= now() and deleted_at is null);
create policy bracelets_staff_select on public.bracelets
for select to authenticated using ((select private.is_staff()));
create policy bracelets_staff_insert on public.bracelets
for insert to authenticated with check ((select private.is_staff()));
create policy bracelets_staff_update on public.bracelets
for update to authenticated using ((select private.is_staff())) with check ((select private.is_staff()));

create policy bracelet_stones_public_select_published on public.bracelet_stones
for select to anon, authenticated
using (
  exists (
    select 1 from public.bracelets b
    where b.id = bracelet_id and b.status = 'published'
      and b.published_at is not null and b.published_at <= now() and b.deleted_at is null
  )
);
create policy bracelet_stones_staff_select on public.bracelet_stones
for select to authenticated using ((select private.is_staff()));
create policy bracelet_stones_staff_insert on public.bracelet_stones
for insert to authenticated with check ((select private.is_staff()));
create policy bracelet_stones_staff_update on public.bracelet_stones
for update to authenticated using ((select private.is_staff())) with check ((select private.is_staff()));
create policy bracelet_stones_staff_delete on public.bracelet_stones
for delete to authenticated using ((select private.is_staff()));

create policy site_contact_settings_public_select on public.site_contact_settings
for select to anon, authenticated using (true);
create policy site_contact_settings_staff_update on public.site_contact_settings
for update to authenticated using ((select private.is_staff())) with check ((select private.is_staff()));

create or replace function public.replace_bracelet_stones(p_bracelet_id uuid, p_stone_ids jsonb)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if jsonb_typeof(p_stone_ids) <> 'array' then
    raise exception 'p_stone_ids must be a JSON array';
  end if;

  delete from public.bracelet_stones where bracelet_id = p_bracelet_id;

  insert into public.bracelet_stones (bracelet_id, stone_id, display_order)
  select p_bracelet_id, (value #>> '{}')::uuid, ordinality::integer - 1
  from jsonb_array_elements(p_stone_ids) with ordinality
  where nullif(value #>> '{}', '') is not null;
end;
$$;

revoke all on function public.replace_bracelet_stones(uuid, jsonb) from public, anon, authenticated;
grant execute on function public.replace_bracelet_stones(uuid, jsonb) to service_role;

revoke all on public.bracelets, public.bracelet_stones, public.site_contact_settings from anon, authenticated;
grant select on public.bracelets, public.bracelet_stones, public.site_contact_settings to anon;
grant select, insert, update on public.bracelets to authenticated;
grant select, insert, update, delete on public.bracelet_stones to authenticated;
grant select, update on public.site_contact_settings to authenticated;

drop policy if exists stone_images_public_select_used on storage.objects;
create policy stone_images_public_select_used on storage.objects
for select to anon, authenticated
using (
  bucket_id = 'stone-images'
  and (
    exists (
      select 1 from public.stones s
      where s.status = 'published' and s.published_at is not null and s.published_at <= now()
        and s.deleted_at is null
        and (s.featured_image = '/stone-images/' || storage.objects.name
          or s.gallery @> array['/stone-images/' || storage.objects.name])
    )
    or exists (
      select 1 from public.stone_jars j
      where j.status = 'published' and j.published_at is not null and j.published_at <= now()
        and j.deleted_at is null
        and (j.featured_image = '/stone-images/' || storage.objects.name
          or j.gallery @> array['/stone-images/' || storage.objects.name])
    )
    or exists (
      select 1 from public.bracelets b
      where b.status = 'published' and b.published_at is not null and b.published_at <= now()
        and b.deleted_at is null
        and (b.featured_image = '/stone-images/' || storage.objects.name
          or b.gallery @> array['/stone-images/' || storage.objects.name])
    )
  )
);
