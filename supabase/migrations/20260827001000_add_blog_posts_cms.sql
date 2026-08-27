do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public'
      and t.typname = 'blog_post_status'
  ) then
    create type public.blog_post_status as enum ('draft', 'published', 'archived');
  end if;
end $$;

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content text not null,
  cover_image_url text,
  status public.blog_post_status not null default 'draft',
  author_id uuid references public.profiles(id) on delete set null,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint blog_posts_title_length check (char_length(trim(title)) between 3 and 160),
  constraint blog_posts_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' and char_length(slug) <= 180),
  constraint blog_posts_excerpt_length check (excerpt is null or char_length(excerpt) <= 320),
  constraint blog_posts_content_length check (char_length(trim(content)) >= 20 and char_length(content) <= 60000),
  constraint blog_posts_cover_url_length check (cover_image_url is null or char_length(cover_image_url) <= 2048)
);

create index if not exists blog_posts_status_idx on public.blog_posts(status);
create index if not exists blog_posts_published_at_idx on public.blog_posts(published_at desc) where deleted_at is null;
create index if not exists blog_posts_slug_idx on public.blog_posts(slug);
create index if not exists blog_posts_author_id_idx on public.blog_posts(author_id);

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists blog_posts_set_updated_at on public.blog_posts;
create trigger blog_posts_set_updated_at
before update on public.blog_posts
for each row execute function private.set_updated_at();

alter table public.blog_posts enable row level security;

drop policy if exists blog_posts_public_select_published on public.blog_posts;
create policy blog_posts_public_select_published
on public.blog_posts
for select
to anon, authenticated
using (
  status = 'published'
  and published_at is not null
  and published_at <= now()
  and deleted_at is null
);

drop policy if exists blog_posts_staff_select on public.blog_posts;
create policy blog_posts_staff_select
on public.blog_posts
for select
to authenticated
using ((select private.is_staff()));

drop policy if exists blog_posts_staff_insert on public.blog_posts;
create policy blog_posts_staff_insert
on public.blog_posts
for insert
to authenticated
with check (
  (select private.is_staff())
  and (author_id is null or author_id = (select auth.uid()))
);

drop policy if exists blog_posts_staff_update on public.blog_posts;
create policy blog_posts_staff_update
on public.blog_posts
for update
to authenticated
using ((select private.is_staff()))
with check (
  (select private.is_staff())
  and (author_id is null or author_id = (select auth.uid()))
);

grant select on public.blog_posts to anon;
grant select, insert, update on public.blog_posts to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'blog-images',
  'blog-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists blog_images_staff_select on storage.objects;
create policy blog_images_staff_select
on storage.objects
for select
to authenticated
using (
  bucket_id = 'blog-images'
  and (select private.is_staff())
);

drop policy if exists blog_images_public_select_used on storage.objects;
create policy blog_images_public_select_used
on storage.objects
for select
to anon, authenticated
using (
  bucket_id = 'blog-images'
  and exists (
    select 1
    from public.blog_posts p
    where p.status = 'published'
      and p.published_at is not null
      and p.published_at <= now()
      and p.deleted_at is null
      and (
        p.cover_image_url like ('%/storage/v1/object/public/blog-images/' || storage.objects.name)
        or p.content like ('%' || storage.objects.name || '%')
      )
  )
);

drop policy if exists blog_images_staff_insert on storage.objects;
create policy blog_images_staff_insert
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'blog-images'
  and (select private.is_staff())
);

drop policy if exists blog_images_staff_update on storage.objects;
create policy blog_images_staff_update
on storage.objects
for update
to authenticated
using (
  bucket_id = 'blog-images'
  and (select private.is_staff())
)
with check (
  bucket_id = 'blog-images'
  and (select private.is_staff())
);

drop policy if exists blog_images_staff_delete on storage.objects;
create policy blog_images_staff_delete
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'blog-images'
  and (select private.is_staff())
);
