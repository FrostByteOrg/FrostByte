BEGIN;
  SELECT plan(1);

  SELECT tests.create_supabase_user('test_member');
  SELECT tests.authenticate_as('test_user');

  -- Ensure RLS is enabled for servers
  SELECT tests.rls_enabled('public', 'servers');

  -- Now if we try to fetch servers, we should get an empty array
  SELECT is_empty(
    (SELECT servers FROM public.servers),
    0,
    'No servers should be returned for users not in any servers'
  );

  SELECT * FROM finish();

ROLLBACK;
