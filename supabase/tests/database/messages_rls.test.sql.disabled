BEGIN;
  SELECT plan(1);

  SELECT tests.create_supabase_user('test_member');
  SELECT tests.authenticate_as('test_member');

  insert into servers (name, description) values ('test', 'test');

  select tests.clear_authentication();

  SELECT
    is_empty(
      $$ select * from servers $$,
      'Anonymous users cannot see servers',
    );

  SELECT * FROM finish();

ROLLBACK;
