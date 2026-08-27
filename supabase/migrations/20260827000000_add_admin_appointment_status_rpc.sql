create or replace function public.admin_change_appointment_status(
  p_appointment_id uuid,
  p_actor_id uuid,
  p_expected_status public.appointment_status,
  p_new_status public.appointment_status,
  p_note text default null
)
returns table (
  appointment_id uuid,
  old_status public.appointment_status,
  new_status public.appointment_status,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_current_status public.appointment_status;
  v_updated_at timestamptz;
begin
  if not exists (
    select 1
    from public.profiles p
    where p.id = p_actor_id
      and p.is_active = true
      and p.role in ('admin', 'staff')
  ) then
    raise exception 'permission denied';
  end if;

  select a.status
  into v_current_status
  from public.appointments a
  where a.id = p_appointment_id
    and a.deleted_at is null
  for update;

  if v_current_status is null then
    raise exception 'appointment not found';
  end if;

  if v_current_status is distinct from p_expected_status then
    raise exception 'appointment updated by another user';
  end if;

  if not (
    (v_current_status = 'pending' and p_new_status in ('confirmed', 'rejected', 'cancelled'))
    or (v_current_status = 'confirmed' and p_new_status in ('completed', 'cancelled', 'no_show'))
  ) then
    raise exception 'invalid appointment status transition';
  end if;

  update public.appointments a
  set
    status = p_new_status,
    cancellation_reason = case
      when p_new_status in ('cancelled', 'rejected') then nullif(trim(coalesce(p_note, '')), '')
      else a.cancellation_reason
    end,
    confirmed_at = case when p_new_status = 'confirmed' then now() else a.confirmed_at end,
    cancelled_at = case when p_new_status in ('cancelled', 'rejected') then now() else a.cancelled_at end,
    updated_at = now()
  where a.id = p_appointment_id
    and a.status = v_current_status
  returning a.updated_at into v_updated_at;

  if v_updated_at is null then
    raise exception 'appointment updated by another user';
  end if;

  insert into public.appointment_status_history (
    appointment_id,
    old_status,
    new_status,
    changed_by,
    note
  ) values (
    p_appointment_id,
    v_current_status,
    p_new_status,
    p_actor_id,
    nullif(trim(coalesce(p_note, '')), '')
  );

  return query select p_appointment_id, v_current_status, p_new_status, v_updated_at;
end;
$$;

revoke all on function public.admin_change_appointment_status(
  uuid,
  uuid,
  public.appointment_status,
  public.appointment_status,
  text
) from public, anon, authenticated;

grant execute on function public.admin_change_appointment_status(
  uuid,
  uuid,
  public.appointment_status,
  public.appointment_status,
  text
) to service_role;
