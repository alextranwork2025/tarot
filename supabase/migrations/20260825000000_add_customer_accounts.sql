alter table public.customers
  add column if not exists auth_user_id uuid references auth.users(id) on delete set null,
  add column if not exists must_change_password boolean not null default false;

create unique index if not exists customers_auth_user_id_key
  on public.customers(auth_user_id)
  where auth_user_id is not null;

create index if not exists customers_phone_idx
  on public.customers(phone);

comment on column public.customers.auth_user_id is
  'Links a customer profile to a Supabase Auth user. Managed server-side only.';

comment on column public.customers.must_change_password is
  'Forces customer to change the default password after first login.';
