do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public' and t.typname = 'stone_content_status'
  ) then
    create type public.stone_content_status as enum ('draft', 'published', 'hidden');
  end if;
end $$;

create table public.stones (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  short_description text,
  content text,
  benefits text,
  suitable_for text,
  elements text[] not null default '{}',
  zodiac_signs text[] not null default '{}',
  colors text[] not null default '{}',
  origin text,
  featured_image text,
  gallery text[] not null default '{}',
  status public.stone_content_status not null default 'draft',
  is_featured boolean not null default false,
  seo_title text,
  seo_description text,
  published_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint stones_name_length check (char_length(trim(name)) between 2 and 120),
  constraint stones_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' and char_length(slug) <= 180),
  constraint stones_short_description_length check (short_description is null or char_length(short_description) <= 320),
  constraint stones_content_length check (content is null or char_length(content) <= 60000),
  constraint stones_text_fields_length check (
    (benefits is null or char_length(benefits) <= 10000)
    and (suitable_for is null or char_length(suitable_for) <= 10000)
    and (origin is null or char_length(origin) <= 2000)
  ),
  constraint stones_featured_image_length check (featured_image is null or char_length(featured_image) <= 2048),
  constraint stones_gallery_size check (cardinality(gallery) <= 20),
  constraint stones_taxonomy_size check (
    cardinality(elements) <= 20 and cardinality(zodiac_signs) <= 20 and cardinality(colors) <= 20
  ),
  constraint stones_seo_length check (
    (seo_title is null or char_length(seo_title) <= 160)
    and (seo_description is null or char_length(seo_description) <= 320)
  )
);

create table public.stone_jars (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  short_description text,
  content text,
  meaning text,
  usage text,
  featured_image text,
  gallery text[] not null default '{}',
  price numeric(12, 0),
  price_label text not null default 'Liên hệ',
  contact_message text,
  status public.stone_content_status not null default 'draft',
  is_featured boolean not null default false,
  seo_title text,
  seo_description text,
  published_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint stone_jars_name_length check (char_length(trim(name)) between 2 and 120),
  constraint stone_jars_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' and char_length(slug) <= 180),
  constraint stone_jars_short_description_length check (short_description is null or char_length(short_description) <= 320),
  constraint stone_jars_content_length check (content is null or char_length(content) <= 60000),
  constraint stone_jars_text_fields_length check (
    (meaning is null or char_length(meaning) <= 10000)
    and (usage is null or char_length(usage) <= 10000)
    and (contact_message is null or char_length(contact_message) <= 1000)
  ),
  constraint stone_jars_featured_image_length check (featured_image is null or char_length(featured_image) <= 2048),
  constraint stone_jars_gallery_size check (cardinality(gallery) <= 20),
  constraint stone_jars_price_nonnegative check (price is null or price >= 0),
  constraint stone_jars_price_label_length check (char_length(trim(price_label)) between 1 and 120),
  constraint stone_jars_seo_length check (
    (seo_title is null or char_length(seo_title) <= 160)
    and (seo_description is null or char_length(seo_description) <= 320)
  )
);

create table public.stone_jar_items (
  id uuid primary key default gen_random_uuid(),
  stone_jar_id uuid not null references public.stone_jars(id) on delete cascade,
  stone_id uuid not null references public.stones(id) on delete restrict,
  description text,
  quantity text,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  constraint stone_jar_items_unique_stone unique (stone_jar_id, stone_id),
  constraint stone_jar_items_description_length check (description is null or char_length(description) <= 2000),
  constraint stone_jar_items_quantity_length check (quantity is null or char_length(quantity) <= 120),
  constraint stone_jar_items_display_order_nonnegative check (display_order >= 0)
);

create index stones_status_idx on public.stones(status);
create index stones_published_at_idx on public.stones(published_at desc) where deleted_at is null;
create index stones_featured_idx on public.stones(is_featured) where is_featured = true and deleted_at is null;
create index stones_created_by_idx on public.stones(created_by);
create index stones_elements_gin_idx on public.stones using gin(elements);
create index stones_colors_gin_idx on public.stones using gin(colors);

create index stone_jars_status_idx on public.stone_jars(status);
create index stone_jars_published_at_idx on public.stone_jars(published_at desc) where deleted_at is null;
create index stone_jars_featured_idx on public.stone_jars(is_featured) where is_featured = true and deleted_at is null;
create index stone_jars_created_by_idx on public.stone_jars(created_by);

create index stone_jar_items_jar_idx on public.stone_jar_items(stone_jar_id, display_order);
create index stone_jar_items_stone_idx on public.stone_jar_items(stone_id);

drop trigger if exists stones_set_updated_at on public.stones;
create trigger stones_set_updated_at
before update on public.stones
for each row execute function private.set_updated_at();

drop trigger if exists stone_jars_set_updated_at on public.stone_jars;
create trigger stone_jars_set_updated_at
before update on public.stone_jars
for each row execute function private.set_updated_at();

alter table public.stones enable row level security;
alter table public.stone_jars enable row level security;
alter table public.stone_jar_items enable row level security;

create policy stones_public_select_published on public.stones
for select to anon, authenticated
using (status = 'published' and published_at is not null and published_at <= now() and deleted_at is null);

create policy stones_staff_select on public.stones
for select to authenticated using ((select private.is_staff()));
create policy stones_staff_insert on public.stones
for insert to authenticated with check ((select private.is_staff()));
create policy stones_staff_update on public.stones
for update to authenticated using ((select private.is_staff())) with check ((select private.is_staff()));
create policy stone_jars_public_select_published on public.stone_jars
for select to anon, authenticated
using (status = 'published' and published_at is not null and published_at <= now() and deleted_at is null);

create policy stone_jars_staff_select on public.stone_jars
for select to authenticated using ((select private.is_staff()));
create policy stone_jars_staff_insert on public.stone_jars
for insert to authenticated with check ((select private.is_staff()));
create policy stone_jars_staff_update on public.stone_jars
for update to authenticated using ((select private.is_staff())) with check ((select private.is_staff()));
create policy stone_jar_items_public_select_published on public.stone_jar_items
for select to anon, authenticated
using (
  exists (
    select 1 from public.stone_jars j
    where j.id = stone_jar_id and j.status = 'published'
      and j.published_at is not null and j.published_at <= now() and j.deleted_at is null
  )
  and exists (
    select 1 from public.stones s
    where s.id = stone_id and s.status = 'published'
      and s.published_at is not null and s.published_at <= now() and s.deleted_at is null
  )
);

create policy stone_jar_items_staff_select on public.stone_jar_items
for select to authenticated using ((select private.is_staff()));
create policy stone_jar_items_staff_insert on public.stone_jar_items
for insert to authenticated with check ((select private.is_staff()));
create policy stone_jar_items_staff_update on public.stone_jar_items
for update to authenticated using ((select private.is_staff())) with check ((select private.is_staff()));
create policy stone_jar_items_staff_delete on public.stone_jar_items
for delete to authenticated using ((select private.is_staff()));

create or replace function public.replace_stone_jar_items(p_stone_jar_id uuid, p_items jsonb)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if jsonb_typeof(p_items) <> 'array' then
    raise exception 'p_items must be a JSON array';
  end if;

  delete from public.stone_jar_items where stone_jar_id = p_stone_jar_id;

  insert into public.stone_jar_items (stone_jar_id, stone_id, description, quantity, display_order)
  select
    p_stone_jar_id,
    (item->>'stoneId')::uuid,
    nullif(trim(item->>'description'), ''),
    nullif(trim(item->>'quantity'), ''),
    coalesce((item->>'displayOrder')::integer, ordinality::integer - 1)
  from jsonb_array_elements(p_items) with ordinality as source(item, ordinality);
end;
$$;

revoke all on function public.replace_stone_jar_items(uuid, jsonb) from public, anon, authenticated;
grant execute on function public.replace_stone_jar_items(uuid, jsonb) to service_role;

revoke all on public.stones, public.stone_jars, public.stone_jar_items from anon, authenticated;
grant select on public.stones, public.stone_jars, public.stone_jar_items to anon;
grant select, insert, update on public.stones, public.stone_jars to authenticated;
grant select, insert, update, delete on public.stone_jar_items to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'stone-images',
  'stone-images',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

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
  )
);

create policy stone_images_staff_select on storage.objects
for select to authenticated
using (bucket_id = 'stone-images' and (select private.is_staff()));
create policy stone_images_staff_insert on storage.objects
for insert to authenticated
with check (bucket_id = 'stone-images' and (select private.is_staff()));
create policy stone_images_staff_update on storage.objects
for update to authenticated
using (bucket_id = 'stone-images' and (select private.is_staff()))
with check (bucket_id = 'stone-images' and (select private.is_staff()));
create policy stone_images_staff_delete on storage.objects
for delete to authenticated
using (bucket_id = 'stone-images' and (select private.is_staff()));
