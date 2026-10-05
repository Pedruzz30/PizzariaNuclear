-- Supabase advisor: the pre-existing helper is SECURITY DEFINER and was executable by API roles.
begin;
do $$
begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    execute 'revoke execute on function public.rls_auto_enable() from public, anon, authenticated';
  end if;
end;
$$;
commit;
