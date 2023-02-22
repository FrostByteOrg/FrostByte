BEGIN;
  SELECT plan(1);

  SELECT tests.create_supabase_user('test_member');
  SELECT tests.authenticate_as('test_user');

  -- Ensure RLS is enabled for servers
  SELECT tests.rls_enabled('public', 'servers');

  -- Now if we try to fetch servers, we should get an empty array
  SELECT policies_are(
    'public', 'profiles',
    ARRAY [
      "Users can view a server they're a part of",
      "Only server owners can modify servers (for now)",
      "Only server owners can delete their servers",
      "Enable insert for authenticated users only"
    ]
  );

  SELECT * FROM finish();

ROLLBACK;
