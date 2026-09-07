do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public'
      and t.typname = 'service_status'
  ) then
    create type public.service_status as enum ('draft', 'published', 'archived');
  end if;
end $$;

alter table public.services
  add column if not exists short_description text,
  add column if not exists content text,
  add column if not exists cover_image_url text,
  add column if not exists suitable_for text,
  add column if not exists benefits text,
  add column if not exists process text,
  add column if not exists preparation_notes text,
  add column if not exists faq jsonb not null default '[]'::jsonb,
  add column if not exists testimonials jsonb not null default '[]'::jsonb,
  add column if not exists seo_title text,
  add column if not exists seo_description text,
  add column if not exists status public.service_status not null default 'draft',
  add column if not exists published_at timestamptz,
  add column if not exists deleted_at timestamptz;

create or replace function private.service_testimonials_have_valid_rating(value jsonb)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select case
    when jsonb_typeof(value) <> 'array' then false
    else (
  select coalesce(
    bool_and(
      not (item ? 'rating')
      or (
        jsonb_typeof(item->'rating') = 'number'
        and (item->>'rating')::numeric between 1 and 5
      )
    ),
    true
  )
  from jsonb_array_elements(value) item
    )
  end;
$$;

alter table public.services
  drop constraint if exists services_slug_format,
  add constraint services_slug_format
    check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' and char_length(slug) <= 180),
  drop constraint if exists services_name_length,
  add constraint services_name_length
    check (char_length(trim(name)) between 2 and 120),
  drop constraint if exists services_short_description_length,
  add constraint services_short_description_length
    check (short_description is null or char_length(short_description) <= 320),
  drop constraint if exists services_description_length,
  add constraint services_description_length
    check (description is null or char_length(description) <= 500),
  drop constraint if exists services_content_length,
  add constraint services_content_length
    check (content is null or char_length(content) <= 60000),
  drop constraint if exists services_cover_url_length,
  add constraint services_cover_url_length
    check (cover_image_url is null or char_length(cover_image_url) <= 2048),
  drop constraint if exists services_seo_title_length,
  add constraint services_seo_title_length
    check (seo_title is null or char_length(seo_title) <= 160),
  drop constraint if exists services_seo_description_length,
  add constraint services_seo_description_length
    check (seo_description is null or char_length(seo_description) <= 320),
  drop constraint if exists services_faq_array,
  add constraint services_faq_array
    check (jsonb_typeof(faq) = 'array'),
  drop constraint if exists services_testimonials_array,
  add constraint services_testimonials_array
    check (jsonb_typeof(testimonials) = 'array'),
  drop constraint if exists services_testimonials_rating_range,
  add constraint services_testimonials_rating_range
    check (private.service_testimonials_have_valid_rating(testimonials));

create index if not exists services_status_idx on public.services(status);
create index if not exists services_published_idx
  on public.services(display_order, created_at desc)
  where deleted_at is null and is_active = true and status = 'published';
create index if not exists services_deleted_at_idx on public.services(deleted_at);

alter table public.services enable row level security;

drop policy if exists services_public_select_published on public.services;
create policy services_public_select_published
on public.services
for select
to anon, authenticated
using (
  status = 'published'
  and is_active = true
  and published_at is not null
  and published_at <= now()
  and deleted_at is null
);

drop policy if exists services_staff_select on public.services;
create policy services_staff_select
on public.services
for select
to authenticated
using ((select private.is_staff()));

drop policy if exists services_staff_insert on public.services;
create policy services_staff_insert
on public.services
for insert
to authenticated
with check ((select private.is_staff()));

drop policy if exists services_staff_update on public.services;
create policy services_staff_update
on public.services
for update
to authenticated
using ((select private.is_staff()))
with check ((select private.is_staff()));

grant select on public.services to anon;
grant select, insert, update on public.services to authenticated;
