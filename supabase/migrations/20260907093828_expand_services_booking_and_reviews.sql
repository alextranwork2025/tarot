do $$
begin
  if not exists (
    select 1 from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public' and t.typname = 'service_review_status'
  ) then
    create type public.service_review_status as enum ('pending', 'published', 'hidden');
  end if;
end $$;

alter table public.services
  add column if not exists delivery_modes text[] not null default array['online', 'in_person']::text[],
  add column if not exists is_featured boolean not null default false;

alter table public.services
  drop constraint if exists services_delivery_modes_valid,
  add constraint services_delivery_modes_valid check (
    cardinality(delivery_modes) between 1 and 2
    and delivery_modes <@ array['online', 'in_person']::text[]
  );

create index if not exists services_featured_idx
  on public.services(is_featured, display_order)
  where deleted_at is null and is_active = true and status = 'published';

alter table public.appointments
  add column if not exists reading_format text,
  add column if not exists topic text,
  add column if not exists submission_token uuid;

alter table public.appointments
  drop constraint if exists appointments_reading_format_valid,
  add constraint appointments_reading_format_valid
    check (reading_format is null or reading_format in ('online', 'in_person')),
  drop constraint if exists appointments_topic_length,
  add constraint appointments_topic_length
    check (topic is null or char_length(topic) <= 120);

create unique index if not exists appointments_submission_token_key
  on public.appointments(submission_token)
  where submission_token is not null;

create table public.service_reviews (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  avatar_url text,
  rating smallint not null,
  content text not null,
  service_id uuid not null references public.services(id) on delete cascade,
  appointment_id uuid references public.appointments(id) on delete set null,
  is_verified boolean not null default false,
  status public.service_review_status not null default 'pending',
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint service_reviews_customer_name_length check (char_length(trim(customer_name)) between 1 and 120),
  constraint service_reviews_rating_range check (rating between 1 and 5),
  constraint service_reviews_content_length check (char_length(trim(content)) between 10 and 3000),
  constraint service_reviews_avatar_url_length check (avatar_url is null or char_length(avatar_url) <= 2048),
  constraint service_reviews_display_order_nonnegative check (display_order >= 0),
  constraint service_reviews_appointment_unique unique (appointment_id)
);

create index service_reviews_public_idx
  on public.service_reviews(display_order, created_at desc)
  where status = 'published';
create index service_reviews_service_id_idx on public.service_reviews(service_id);
create index service_reviews_appointment_id_idx on public.service_reviews(appointment_id);

drop trigger if exists service_reviews_set_updated_at on public.service_reviews;
create trigger service_reviews_set_updated_at
before update on public.service_reviews
for each row execute function private.set_updated_at();

alter table public.service_reviews enable row level security;

create policy service_reviews_anon_select_published on public.service_reviews
for select to anon
using (status = 'published');

create policy service_reviews_authenticated_select on public.service_reviews
for select to authenticated
using (status = 'published' or (select private.is_staff()));

create policy service_reviews_staff_insert on public.service_reviews
for insert to authenticated
with check ((select private.is_staff()));

create policy service_reviews_staff_update on public.service_reviews
for update to authenticated
using ((select private.is_staff()))
with check ((select private.is_staff()));

create policy service_reviews_staff_delete on public.service_reviews
for delete to authenticated
using ((select private.is_staff()));

revoke all on public.service_reviews from anon, authenticated;
grant select on public.service_reviews to anon;
grant select, insert, update, delete on public.service_reviews to authenticated;
