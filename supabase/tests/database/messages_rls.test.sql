BEGIN;
  SELECT plan(4);

  SELECT tests.create_supabase_user('test_member');
  SELECT tests.authenticate_as('test_user');

  -- Ensure RLS is enabled for servers
  SELECT tests.rls_enabled('public', 'servers');

  -- Now if we try to fetch servers, we should get an empty array
  SELECT tests.assert_array_length(
    (SELECT servers FROM public.servers),
    0,
    'No servers should be returned'
  );

  SELECT * FROM finish();

ROLLBACK;
