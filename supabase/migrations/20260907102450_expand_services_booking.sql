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
