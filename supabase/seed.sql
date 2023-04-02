--
-- PostgreSQL database dump
--

-- Dumped from database version 15.1
-- Dumped by pg_dump version 15.2 (Ubuntu 15.2-1.pgdg20.04+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: pg_database_owner
--

-- CREATE SCHEMA public;


ALTER SCHEMA public OWNER TO pg_database_owner;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: pg_database_owner
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Name: relationship; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.relationship AS ENUM (
    'friend_requested',
    'friends',
    'blocked'
);


ALTER TYPE public.relationship OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: profile_relations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.profile_relations (
    id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT (now() AT TIME ZONE 'utc'::text),
    user1 uuid NOT NULL,
    user2 uuid NOT NULL,
    relationship public.relationship NOT NULL
);


ALTER TABLE public.profile_relations OWNER TO postgres;

--
-- Name: accept_friend_request(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.accept_friend_request(t_p_id uuid) RETURNS SETOF public.profile_relations
    LANGUAGE plpgsql
    AS $$
BEGIN
  RETURN QUERY UPDATE profile_relations
    SET relationship='friends'
    WHERE (
      ((user1 = auth.uid() AND user2 = t_p_id)
      OR (user1 = t_p_id AND user2 = auth.uid()))
      AND relationship = 'friend_requested'
    )
    RETURNING *;
END $$;


ALTER FUNCTION public.accept_friend_request(t_p_id uuid) OWNER TO postgres;

--
-- Name: add_everyone_role_to_new_joins(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.add_everyone_role_to_new_joins() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO server_user_roles(server_user_id, role_id)
  VALUES (
    new.id,
    (
      SELECT id
      FROM server_roles
      WHERE (
        server_id = new.server_id
        AND name = 'EVERYONE'
        AND server_roles.is_system
      )
    )
  );
  return new;
END $$;


ALTER FUNCTION public.add_everyone_role_to_new_joins() OWNER TO postgres;

--
-- Name: create_base_channel_permissions_on_channel_create(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.create_base_channel_permissions_on_channel_create() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  c_id bigint;

BEGIN
  -- c_id := nextval('channels_channel_id_seq');
  c_id := new.channel_id;

  -- On the creation of a new channel, we should create some default permissions
  INSERT INTO channel_permissions(channel_id, role_id, permissions)
  VALUES
    (c_id, (SELECT id FROM server_roles WHERE (server_id = new.server_id AND name = 'OWNER')), 7),
    (c_id, (SELECT id FROM server_roles WHERE (server_id = new.server_id AND name = 'EVERYONE')), 6);

  return new;
END $$;


ALTER FUNCTION public.create_base_channel_permissions_on_channel_create() OWNER TO postgres;

--
-- Name: create_dm(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.create_dm(t_p_id uuid) RETURNS TABLE(channel_id bigint, server_id bigint, recipient json)
    LANGUAGE plpgsql
    AS $$
DECLARE
  s_id bigint;
  c_id bigint;
  r json;

BEGIN
  -- Make the server (and by derivative, the channel + roles)
  INSERT INTO servers(name, is_dm) VALUES ('Direct Message', TRUE) RETURNING id INTO s_id;

  -- Now remove the OWNER role
  DELETE FROM server_roles WHERE server_roles.server_id = s_id AND server_roles.name = 'OWNER';

  -- Get the channel that was created
  SELECT channels.channel_id INTO c_id FROM channels WHERE channels.server_id = s_id;

  -- Add the recipient to server_users
  INSERT INTO server_users(profile_id, server_id) VALUES (t_p_id, s_id);

  -- And finally, fetch their profile
  SELECT row_to_json(_profile)
  INTO r
  FROM (
    SELECT * FROM profiles WHERE profiles.id = t_p_id
  ) AS _profile;

  -- I have NO idea how, but somehow s_id and c_id are reversed???????
  RETURN QUERY SELECT * FROM
    -- (SELECT s_id) AS server_id,
    -- (SELECT c_id) AS channel_id,
    (SELECT c_id) AS server_id,
    (SELECT s_id) AS channel_id,
    (SELECT r) AS recipient;
END $$;


ALTER FUNCTION public.create_dm(t_p_id uuid) OWNER TO postgres;

--
-- Name: messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.messages (
    id bigint NOT NULL,
    sent_time timestamp with time zone DEFAULT (now() AT TIME ZONE 'utc'::text) NOT NULL,
    is_edited boolean DEFAULT false NOT NULL,
    is_pinned boolean DEFAULT false NOT NULL,
    edited_time timestamp with time zone DEFAULT (now() AT TIME ZONE 'utc'::text),
    channel_id bigint NOT NULL,
    author_id bigint NOT NULL,
    content text NOT NULL,
    profile_id uuid NOT NULL,
    CONSTRAINT no_empty_str CHECK ((content <> ''::text))
);


ALTER TABLE public.messages OWNER TO postgres;

--
-- Name: createmessage(bigint, uuid, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.createmessage(c_id bigint, p_id uuid, content text) RETURNS SETOF public.messages
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    INSERT INTO messages (channel_id, author_id, profile_id, content)
    VALUES (
      c_id,
      (SELECT id FROM server_users WHERE (server_users.profile_id = p_id AND server_users.server_id = (SELECT server_id FROM channels WHERE channel_id = c_id))),
      p_id,
      content
    )
    RETURNING *;
END $$;


ALTER FUNCTION public.createmessage(c_id bigint, p_id uuid, content text) OWNER TO postgres;

--
-- Name: delete_servcrIcons(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public."delete_servcrIcons"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  DELETE FROM storage.objects
WHERE name LIKE '%' || old.id::text || '.%';

  return new;
END;$$;


ALTER FUNCTION public."delete_servcrIcons"() OWNER TO postgres;

--
-- Name: detailed_profile_relations(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.detailed_profile_relations() RETURNS TABLE(id bigint, target_profile json, initiator_profile_id uuid, relationship public.relationship, created_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $$
BEGIN
  RETURN QUERY SELECT
    profile_relations.id,
    (
      SELECT row_to_json(_profile1)
      FROM (
        SELECT *
        FROM profiles
        WHERE profiles.id = (
          CASE
            WHEN profile_relations.user1 = auth.uid() THEN profile_relations.user2
            ELSE profile_relations.user1
          END
        )
      ) AS _profile1
    ) AS target_profile,
    profile_relations.user1 AS initiator_profile_id,
    profile_relations.relationship,
    profile_relations.created_at
  FROM profile_relations;
END $$;


ALTER FUNCTION public.detailed_profile_relations() OWNER TO postgres;

--
-- Name: flag_message_edits(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.flag_message_edits() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$BEGIN
  new.is_edited := new.content != old.content;
  return new;
END;$$;


ALTER FUNCTION public.flag_message_edits() OWNER TO postgres;

--
-- Name: get_all_channels_for_user(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_all_channels_for_user(p_id uuid) RETURNS TABLE(channel_id integer)
    LANGUAGE sql
    AS $$
  SELECT c.channel_id FROM channels c LEFT JOIN (
    SELECT server_id
    FROM server_users
    WHERE profile_id=p_id
  ) AS su ON c.server_id=su.server_id
$$;


ALTER FUNCTION public.get_all_channels_for_user(p_id uuid) OWNER TO postgres;

--
-- Name: get_channel_permission_flags(bigint); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_channel_permission_flags(c_id bigint) RETURNS integer
    LANGUAGE sql IMMUTABLE
    AS $$SELECT BIT_OR(permissions)
FROM channel_permissions
LEFT JOIN server_user_roles ON (server_user_roles.role_id = channel_permissions.role_id)
LEFT JOIN server_users ON (server_users.id = server_user_roles.server_user_id)
WHERE channel_id = c_id AND server_users.profile_id = auth.uid()
$$;


ALTER FUNCTION public.get_channel_permission_flags(c_id bigint) OWNER TO postgres;

--
-- Name: get_detailed_profile_relation(bigint); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_detailed_profile_relation(pr_id bigint) RETURNS TABLE(id bigint, target_profile json, initiator_profile_id uuid, relationship public.relationship, created_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $$
BEGIN
  RETURN QUERY SELECT
    profile_relations.id,
    (
      SELECT row_to_json(_profile1)
      FROM (
        SELECT *
        FROM profiles
        WHERE profiles.id = (
          CASE
            WHEN profile_relations.user1 = auth.uid() THEN profile_relations.user2
            ELSE profile_relations.user1
          END
        )
      ) AS _profile1
    ) AS target_profile,
    profile_relations.user1 AS initiator_profile_id,
    profile_relations.relationship,
    profile_relations.created_at
  FROM profile_relations
  WHERE profile_relations.id = pr_id;
END $$;


ALTER FUNCTION public.get_detailed_profile_relation(pr_id bigint) OWNER TO postgres;

--
-- Name: get_dm_channel_and_target_profile_by_server_id(bigint); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_dm_channel_and_target_profile_by_server_id(s_id bigint) RETURNS TABLE(channel_id bigint, recipient json)
    LANGUAGE plpgsql
    AS $$
BEGIN
  RETURN QUERY SELECT
    channels.channel_id,
    (
      SELECT row_to_json(_profile)
      FROM (
        SELECT * FROM profiles WHERE profiles.id = server_users.profile_id
      ) AS _profile
    ) AS recipient
  FROM servers
  LEFT JOIN channels ON channels.server_id = servers.id
  LEFT JOIN server_users ON server_users.server_id = servers.id
  WHERE
    servers.is_dm
    AND servers.id = s_id
    AND server_users.profile_id != auth.uid();
END $$;


ALTER FUNCTION public.get_dm_channel_and_target_profile_by_server_id(s_id bigint) OWNER TO postgres;

--
-- Name: get_dm_channels_and_target_profiles(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_dm_channels_and_target_profiles() RETURNS TABLE(channel_id bigint, server_id bigint, recipient json)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY SELECT
      channels.channel_id,
      channels.server_id,
      (
        SELECT row_to_json(_profile)
        FROM (
          SELECT * FROM profiles WHERE profiles.id = server_users.profile_id
        ) AS _profile
      ) AS recipient
    FROM servers
    LEFT JOIN channels ON channels.server_id = servers.id
    LEFT JOIN server_users ON server_users.server_id = servers.id
    WHERE servers.is_dm AND server_users.profile_id != auth.uid() AND is_user_in_server(auth.uid(), servers.id);
END $$;


ALTER FUNCTION public.get_dm_channels_and_target_profiles() OWNER TO postgres;

--
-- Name: get_highest_role_position_for_user(uuid, bigint); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_highest_role_position_for_user(p_id uuid, s_id bigint) RETURNS integer
    LANGUAGE sql IMMUTABLE
    AS $$SELECT server_roles.position
FROM server_user_roles
LEFT JOIN server_roles
ON (server_roles.id = server_user_roles.role_id)
WHERE (server_roles.server_id = s_id AND server_user_roles.server_user_id = (
  SELECT id FROM server_users WHERE (server_id = server_roles.server_id AND profile_id = p_id)
))
ORDER BY server_roles.position DESC
LIMIT 1;$$;


ALTER FUNCTION public.get_highest_role_position_for_user(p_id uuid, s_id bigint) OWNER TO postgres;

--
-- Name: get_message_with_server_profile(bigint); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_message_with_server_profile(m_id bigint) RETURNS TABLE(id bigint, sent_time timestamp with time zone, is_edited boolean, is_pinned boolean, edited_time timestamp with time zone, channel_id bigint, content text, author json, profile json, roles json)
    LANGUAGE plpgsql
    AS $$
  BEGIN
  RETURN QUERY (  SELECT
    messages.id as id,
    messages.sent_time as sent_time,
    messages.is_edited as is_edited,
    messages.is_pinned as is_pinned,
    messages.edited_time as edited_time,
    messages.channel_id as channel_id,
    messages.content as content,

    (
      SELECT row_to_json(_server_users)
      FROM (
        SELECT server_users.*
        FROM server_users
        WHERE server_users.id = messages.author_id
      ) AS _server_users
    ) AS author,

    (
      SELECT row_to_json(_profiles)
      FROM (
        SELECT profiles.*
        FROM profiles
        WHERE profiles.id = messages.profile_id
      ) AS _profiles
    ) AS profile,

    (
      SELECT array_to_json(array_agg(row_to_json(_roles)))
      FROM (
        SELECT server_roles.*
        FROM server_roles
        WHERE server_roles.id IN (
          SELECT role_id
          FROM server_user_roles
          WHERE server_user_roles.server_user_id = server_users.id
        )
        ORDER BY server_roles.position DESC
      ) AS _roles
    ) AS roles
  FROM messages
  LEFT JOIN server_users ON server_users.id = messages.author_id
  LEFT JOIN profiles ON profiles.id = messages.profile_id
  WHERE messages.id = m_id);
END $$;


ALTER FUNCTION public.get_message_with_server_profile(m_id bigint) OWNER TO postgres;

--
-- Name: get_messages_in_channel_with_server_profile(bigint); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_messages_in_channel_with_server_profile(c_id bigint) RETURNS TABLE(id bigint, sent_time timestamp with time zone, is_edited boolean, is_pinned boolean, edited_time timestamp with time zone, channel_id bigint, content text, author json, profile json, roles json)
    LANGUAGE plpgsql
    AS $$
  BEGIN
  RETURN QUERY (  SELECT
    messages.id as id,
    messages.sent_time as sent_time,
    messages.is_edited as is_edited,
    messages.is_pinned as is_pinned,
    messages.edited_time as edited_time,
    messages.channel_id as channel_id,
    messages.content as content,

    (
      SELECT row_to_json(_server_users)
      FROM (
        SELECT server_users.*
        FROM server_users
        WHERE server_users.id = messages.author_id
      ) AS _server_users
    ) AS author,

    (
      SELECT row_to_json(_profiles)
      FROM (
        SELECT profiles.*
        FROM profiles
        WHERE profiles.id = messages.profile_id
      ) AS _profiles
    ) AS profile,

    (
      SELECT array_to_json(array_agg(row_to_json(_roles)))
      FROM (
        SELECT server_roles.*
        FROM server_roles
        WHERE server_roles.id IN (
          SELECT role_id
          FROM server_user_roles
          WHERE server_user_roles.server_user_id = server_users.id
        )
        ORDER BY server_roles.position DESC
      ) AS _roles
    ) AS roles
  FROM messages
  LEFT JOIN server_users ON server_users.id = messages.author_id
  LEFT JOIN profiles ON profiles.id = messages.profile_id
  WHERE messages.channel_id = c_id);
END $$;


ALTER FUNCTION public.get_messages_in_channel_with_server_profile(c_id bigint) OWNER TO postgres;

--
-- Name: get_owner_id_of_server_from_message(bigint); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_owner_id_of_server_from_message(m_id bigint) RETURNS uuid
    LANGUAGE sql
    AS $$SELECT profile_id from server_users WHERE (is_owner AND server_id = (
  SELECT id FROM servers WHERE (id = (
    SELECT server_id FROM channels WHERE (channel_id = (
      SELECT channel_id FROM messages WHERE (id = m_id)
    ))
  ))
));$$;


ALTER FUNCTION public.get_owner_id_of_server_from_message(m_id bigint) OWNER TO postgres;

--
-- Name: get_permission_flags_for_server_user(bigint, uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_permission_flags_for_server_user(s_id bigint, p_id uuid) RETURNS integer
    LANGUAGE sql IMMUTABLE
    AS $$SELECT bit_or(server_roles.permissions)
FROM server_user_roles
LEFT JOIN server_roles
ON (server_user_roles.role_id = server_roles.id)
WHERE (server_user_id = (
  SELECT id
  FROM server_users
  WHERE (server_id = s_id AND profile_id = p_id)
))$$;


ALTER FUNCTION public.get_permission_flags_for_server_user(s_id bigint, p_id uuid) OWNER TO postgres;

--
-- Name: get_profile_relationship_by_target_profile_id(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_profile_relationship_by_target_profile_id(t_p_id uuid) RETURNS SETOF public.profile_relations
    LANGUAGE plpgsql
    AS $$
BEGIN
  RETURN QUERY SELECT *
    FROM profile_relations
    WHERE (
      (user1 = auth.uid() AND user2 = t_p_id)
      OR (user1 = t_p_id AND user2 = auth.uid())
    );
END $$;


ALTER FUNCTION public.get_profile_relationship_by_target_profile_id(t_p_id uuid) OWNER TO postgres;

--
-- Name: get_roles_for_user_in_server(uuid, bigint); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_roles_for_user_in_server(p_id uuid, s_id bigint) RETURNS void
    LANGUAGE sql IMMUTABLE
    AS $$
SELECT server_roles.id, server_roles.name, server_roles.permissions, server_roles.color, server_roles.is_system, server_roles.position FROM server_roles
LEFT JOIN server_user_roles ON (server_user_roles.role_id = server_roles.id)
LEFT JOIN server_users ON (server_user_roles.server_user_id = server_users.id)
WHERE server_users.profile_id = p_id AND server_users.server_id = s_id$$;


ALTER FUNCTION public.get_roles_for_user_in_server(p_id uuid, s_id bigint) OWNER TO postgres;

--
-- Name: get_server_id_of_message(bigint); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_server_id_of_message(m_id bigint) RETURNS bigint
    LANGUAGE sql IMMUTABLE
    AS $$SELECT id FROM servers WHERE (id = (
    SELECT server_id FROM channels LEFT JOIN messages ON (messages.channel_id = channels.channel_id) WHERE (messages.id = m_id)
))$$;


ALTER FUNCTION public.get_server_id_of_message(m_id bigint) OWNER TO postgres;

--
-- Name: get_server_profile_for_user(bigint, uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_server_profile_for_user(s_id bigint, p_id uuid) RETURNS TABLE(id uuid, updated_at timestamp with time zone, username text, full_name text, avatar_url text, website text, email text, server_user json, roles json)
    LANGUAGE plpgsql
    AS $$
BEGIN
  RETURN QUERY (SELECT
    profiles.*,
    row_to_json(server_users) as server_user,

    (
      SELECT array_to_json(array_agg(row_to_json(_roles)))
      FROM (
        SELECT server_roles.*
        FROM server_roles
        WHERE server_roles.id IN (
          SELECT role_id FROM server_user_roles WHERE server_user_roles.server_user_id = server_users.id
        )
        ORDER BY server_roles.position DESC
      ) AS _roles
    ) AS roles
  FROM profiles
  LEFT JOIN server_users ON profiles.id = server_users.profile_id
  WHERE profiles.id = p_id AND server_users.server_id = s_id);
END $$;


ALTER FUNCTION public.get_server_profile_for_user(s_id bigint, p_id uuid) OWNER TO postgres;

--
-- Name: servers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.servers (
    id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT (now() AT TIME ZONE 'utc'::text),
    name text NOT NULL,
    description text,
    image_url text,
    is_dm boolean DEFAULT false NOT NULL,
    CONSTRAINT no_empty_name CHECK ((TRIM(BOTH FROM name) <> ''::text))
);


ALTER TABLE public.servers OWNER TO postgres;

--
-- Name: TABLE servers; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.servers IS 'Table containing all servers';


--
-- Name: get_servers_for_user(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_servers_for_user() RETURNS SETOF public.servers
    LANGUAGE plpgsql
    AS $$
BEGIN
  RETURN QUERY SELECT * FROM servers WHERE is_user_in_server(auth.uid(), server_id);
END;
$$;


ALTER FUNCTION public.get_servers_for_user() OWNER TO postgres;

--
-- Name: profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    updated_at timestamp with time zone,
    username text NOT NULL,
    full_name text,
    avatar_url text,
    website text,
    email text NOT NULL,
    CONSTRAINT username_length CHECK ((char_length(username) >= 3))
);


ALTER TABLE public.profiles OWNER TO postgres;

--
-- Name: get_users_in_server(bigint); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_users_in_server(s_id bigint) RETURNS SETOF public.profiles
    LANGUAGE plpgsql
    AS $$
BEGIN
  RETURN QUERY SELECT * FROM profiles WHERE id IN (
    SELECT profile_id FROM server_users WHERE server_id = s_id
  );
END;
$$;


ALTER FUNCTION public.get_users_in_server(s_id bigint) OWNER TO postgres;

--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
begin
  insert into public.profiles (id, full_name, avatar_url, email, username)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', new.email, new.raw_user_meta_data->>'username' );
  return new;
end;
$$;


ALTER FUNCTION public.handle_new_user() OWNER TO postgres;

--
-- Name: is_user_in_server(uuid, bigint); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.is_user_in_server(p_id uuid, s_id bigint) RETURNS boolean
    LANGUAGE sql IMMUTABLE
    AS $$SELECT EXISTS (
  SELECT 1 FROM server_users WHERE (p_id = profile_id AND s_id = server_id)
);$$;


ALTER FUNCTION public.is_user_in_server(p_id uuid, s_id bigint) OWNER TO postgres;

--
-- Name: remove_user_from_server_on_ban(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.remove_user_from_server_on_ban() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$BEGIN
  DELETE FROM server_users WHERE (
      profile_id = new.profile_id
      AND server_id = new.server_id
  );
  return new;
END;$$;


ALTER FUNCTION public.remove_user_from_server_on_ban() OWNER TO postgres;

--
-- Name: server_create_hook(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.server_create_hook() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  s_id bigint;

BEGIN
  -- s_id := nextval('servers_id_seq');
  s_id = new.id;

  -- Next, we need to create the roles
  INSERT INTO server_roles(name, permissions, server_id, is_system, position)
  VALUES ('OWNER', 1, s_id, TRUE, 32767), ('EVERYONE', 256, s_id, TRUE, 0);

  -- Before we do anything, we need to add the user to server_users
  INSERT INTO server_users(profile_id, server_id)
  VALUES (auth.uid(), s_id);

  -- Now let's add the general channel
  INSERT INTO channels(name, server_id) VALUES ('general', s_id);

  -- Now that the roles are made, we can assign the owner their OWNER role
  INSERT INTO server_user_roles(server_user_id, role_id)
  VALUES (
    (SELECT id FROM server_users WHERE (profile_id = auth.uid() AND server_id = s_id)),
    (SELECT id FROM server_roles WHERE (server_id = s_id AND name = 'OWNER'))
  );

  return new;
END $$;


ALTER FUNCTION public.server_create_hook() OWNER TO postgres;

--
-- Name: channel_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.channel_permissions (
    id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT (now() AT TIME ZONE 'utc'::text) NOT NULL,
    role_id bigint NOT NULL,
    permissions smallint DEFAULT '6'::smallint NOT NULL,
    channel_id bigint NOT NULL
);


ALTER TABLE public.channel_permissions OWNER TO postgres;

--
-- Name: TABLE channel_permissions; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.channel_permissions IS 'Permissions for channels';


--
-- Name: channel_permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.channel_permissions ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.channel_permissions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: channels; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.channels (
    created_at timestamp with time zone DEFAULT (now() AT TIME ZONE 'utc'::text),
    name text NOT NULL,
    channel_id bigint NOT NULL,
    server_id bigint NOT NULL,
    description text,
    is_media boolean DEFAULT false NOT NULL,
    CONSTRAINT no_empty_str CHECK ((TRIM(BOTH FROM name) <> ''::text))
);


ALTER TABLE public.channels OWNER TO postgres;

--
-- Name: COLUMN channels.is_media; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.channels.is_media IS 'Whether this channel can be used for voice/video calls/sharing or not';


--
-- Name: channels_channel_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.channels ALTER COLUMN channel_id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.channels_channel_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: server_invites; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.server_invites (
    id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT (now() AT TIME ZONE 'utc'::text),
    expires_at timestamp with time zone,
    uses_remaining bigint,
    url_id text DEFAULT extensions.uuid_generate_v4() NOT NULL,
    server_id bigint NOT NULL,
    channel_id bigint NOT NULL
);


ALTER TABLE public.server_invites OWNER TO postgres;

--
-- Name: TABLE server_invites; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.server_invites IS 'Invite links for servers';


--
-- Name: COLUMN server_invites.channel_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.server_invites.channel_id IS 'Channel the invite drops you in';


--
-- Name: invites_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.server_invites ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.invites_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: messages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.messages ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.messages_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: profile_friends_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.profile_relations ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.profile_friends_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: server_bans; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.server_bans (
    id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT (now() AT TIME ZONE 'utc'::text) NOT NULL,
    profile_id uuid NOT NULL,
    server_id bigint NOT NULL,
    reason text DEFAULT ''::text NOT NULL
);


ALTER TABLE public.server_bans OWNER TO postgres;

--
-- Name: server_bans_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.server_bans ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.server_bans_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: server_roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.server_roles (
    id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT (now() AT TIME ZONE 'utc'::text),
    name text DEFAULT ''::text NOT NULL,
    permissions integer DEFAULT 0 NOT NULL,
    server_id bigint NOT NULL,
    color character varying(7),
    is_system boolean DEFAULT false NOT NULL,
    "position" smallint NOT NULL
);


ALTER TABLE public.server_roles OWNER TO postgres;

--
-- Name: TABLE server_roles; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.server_roles IS 'Roles defined for the server';


--
-- Name: server_roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.server_roles ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.server_roles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: server_user_roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.server_user_roles (
    id bigint NOT NULL,
    server_user_id bigint NOT NULL,
    role_id bigint NOT NULL
);


ALTER TABLE public.server_user_roles OWNER TO postgres;

--
-- Name: server_user_roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.server_user_roles ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.server_user_roles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: server_users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.server_users (
    joined_at timestamp with time zone DEFAULT (now() AT TIME ZONE 'utc'::text),
    nickname text,
    profile_id uuid NOT NULL,
    server_id bigint NOT NULL,
    id bigint NOT NULL
);


ALTER TABLE public.server_users OWNER TO postgres;

--
-- Name: TABLE server_users; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.server_users IS 'middleground for server users, contains user data contextualized to the server';


--
-- Name: server_users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.server_users ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.server_users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: servers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.servers ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.servers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: user_plugins; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_plugins (
    id bigint NOT NULL,
    profile_id uuid NOT NULL,
    source_url text NOT NULL,
    is_enabled boolean DEFAULT false NOT NULL,
    settings_data json DEFAULT '{}'::json NOT NULL
);


ALTER TABLE public.user_plugins OWNER TO postgres;

--
-- Name: user_plugins_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.user_plugins ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.user_plugins_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: channel_permissions channel_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.channel_permissions
    ADD CONSTRAINT channel_permissions_pkey PRIMARY KEY (id);


--
-- Name: channels channels_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.channels
    ADD CONSTRAINT channels_pkey PRIMARY KEY (channel_id);


--
-- Name: server_invites invites_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.server_invites
    ADD CONSTRAINT invites_pkey PRIMARY KEY (id);


--
-- Name: server_invites invites_url_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.server_invites
    ADD CONSTRAINT invites_url_id_key UNIQUE (url_id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: profile_relations profile_friends_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profile_relations
    ADD CONSTRAINT profile_friends_pkey PRIMARY KEY (id);


--
-- Name: profile_relations profile_friends_user1_user2_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profile_relations
    ADD CONSTRAINT profile_friends_user1_user2_key UNIQUE (user1, user2);


--
-- Name: profiles profiles_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_email_key UNIQUE (email);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_username_key UNIQUE (username);


--
-- Name: server_bans server_bans_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.server_bans
    ADD CONSTRAINT server_bans_pkey PRIMARY KEY (id);


--
-- Name: server_roles server_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.server_roles
    ADD CONSTRAINT server_roles_pkey PRIMARY KEY (id);


--
-- Name: server_user_roles server_user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.server_user_roles
    ADD CONSTRAINT server_user_roles_pkey PRIMARY KEY (id);


--
-- Name: server_users server_users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.server_users
    ADD CONSTRAINT server_users_pkey PRIMARY KEY (id);


--
-- Name: servers servers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.servers
    ADD CONSTRAINT servers_pkey PRIMARY KEY (id);


--
-- Name: user_plugins user_plugins_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_plugins
    ADD CONSTRAINT user_plugins_pkey PRIMARY KEY (id);


--
-- Name: iprofile_friends; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX iprofile_friends ON public.profile_relations USING btree (GREATEST(user1, user2), LEAST(user1, user2));


--
-- Name: server_users add_everyone_role_to_new_joins; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER add_everyone_role_to_new_joins AFTER INSERT ON public.server_users FOR EACH ROW EXECUTE FUNCTION public.add_everyone_role_to_new_joins();


--
-- Name: channels create_base_channel_permissions_on_channel_create; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER create_base_channel_permissions_on_channel_create AFTER INSERT ON public.channels FOR EACH ROW EXECUTE FUNCTION public.create_base_channel_permissions_on_channel_create();


--
-- Name: servers delete_serverIcons_when_server_delete; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER "delete_serverIcons_when_server_delete" BEFORE DELETE ON public.servers FOR EACH STATEMENT EXECUTE FUNCTION public."delete_servcrIcons"();


--
-- Name: messages flag_message_edits; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER flag_message_edits BEFORE UPDATE ON public.messages FOR EACH ROW EXECUTE FUNCTION public.flag_message_edits();


--
-- Name: server_bans remove_user_from_server_on_ban; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER remove_user_from_server_on_ban AFTER INSERT ON public.server_bans FOR EACH ROW EXECUTE FUNCTION public.remove_user_from_server_on_ban();


--
-- Name: servers server_create_hook; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER server_create_hook AFTER INSERT ON public.servers FOR EACH ROW EXECUTE FUNCTION public.server_create_hook();

--
-- Name: users handle_new_user; Type: TRIGGER; Schema: auth; Owner: postgres
--

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

--
-- Name: channel_permissions channel_permissions_channel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.channel_permissions
    ADD CONSTRAINT channel_permissions_channel_id_fkey FOREIGN KEY (channel_id) REFERENCES public.channels(channel_id) ON DELETE CASCADE;


--
-- Name: channel_permissions channel_permissions_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.channel_permissions
    ADD CONSTRAINT channel_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.server_roles(id) ON DELETE CASCADE;


--
-- Name: channels channels_server_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.channels
    ADD CONSTRAINT channels_server_id_fkey FOREIGN KEY (server_id) REFERENCES public.servers(id) ON DELETE CASCADE;


--
-- Name: messages messages_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.server_users(id) ON DELETE SET NULL;


--
-- Name: messages messages_channel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_channel_id_fkey FOREIGN KEY (channel_id) REFERENCES public.channels(channel_id) ON DELETE CASCADE;


--
-- Name: messages messages_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: profile_relations profile_relations_user1_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profile_relations
    ADD CONSTRAINT profile_relations_user1_fkey FOREIGN KEY (user1) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: profile_relations profile_relations_user2_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profile_relations
    ADD CONSTRAINT profile_relations_user2_fkey FOREIGN KEY (user2) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: server_bans server_bans_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.server_bans
    ADD CONSTRAINT server_bans_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: server_bans server_bans_server_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.server_bans
    ADD CONSTRAINT server_bans_server_id_fkey FOREIGN KEY (server_id) REFERENCES public.servers(id) ON DELETE CASCADE;


--
-- Name: server_invites server_invites_channel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.server_invites
    ADD CONSTRAINT server_invites_channel_id_fkey FOREIGN KEY (channel_id) REFERENCES public.channels(channel_id) ON DELETE CASCADE;


--
-- Name: server_invites server_invites_server_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.server_invites
    ADD CONSTRAINT server_invites_server_id_fkey FOREIGN KEY (server_id) REFERENCES public.servers(id) ON DELETE CASCADE;


--
-- Name: server_roles server_roles_server_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.server_roles
    ADD CONSTRAINT server_roles_server_id_fkey FOREIGN KEY (server_id) REFERENCES public.servers(id) ON DELETE CASCADE;


--
-- Name: server_user_roles server_user_roles_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.server_user_roles
    ADD CONSTRAINT server_user_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.server_roles(id) ON DELETE CASCADE;


--
-- Name: server_user_roles server_user_roles_server_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.server_user_roles
    ADD CONSTRAINT server_user_roles_server_user_id_fkey FOREIGN KEY (server_user_id) REFERENCES public.server_users(id) ON DELETE CASCADE;


--
-- Name: server_users server_users_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.server_users
    ADD CONSTRAINT server_users_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: server_users server_users_server_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.server_users
    ADD CONSTRAINT server_users_server_id_fkey FOREIGN KEY (server_id) REFERENCES public.servers(id) ON DELETE CASCADE;


--
-- Name: user_plugins user_plugins_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_plugins
    ADD CONSTRAINT user_plugins_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id);


--
-- Name: server_invites CREATE_INVITES or OWNER permissions can create invites; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "CREATE_INVITES or OWNER permissions can create invites" ON public.server_invites FOR INSERT TO authenticated WITH CHECK (( SELECT (((get_permission_flags_for_server_user.get_permission_flags_for_server_user & 256) = 256) OR ((get_permission_flags_for_server_user.get_permission_flags_for_server_user & 1) = 1))
   FROM public.get_permission_flags_for_server_user(server_invites.server_id, auth.uid()) get_permission_flags_for_server_user(get_permission_flags_for_server_user)));


--
-- Name: servers Enable insert for authenticated users only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable insert for authenticated users only" ON public.servers FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: channels If channel perms don't exist yet, allow read; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "If channel perms don't exist yet, allow read" ON public.channels FOR SELECT TO authenticated USING ((NOT (EXISTS ( SELECT 1
   FROM public.channel_permissions
  WHERE (channels.channel_id = channel_permissions.channel_id)))));


--
-- Name: channels MANAGE_CHANNELS and OWNER can delete channels; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "MANAGE_CHANNELS and OWNER can delete channels" ON public.channels FOR DELETE TO authenticated USING ((((public.get_permission_flags_for_server_user(server_id, auth.uid()) & 8) = 8) OR ((public.get_permission_flags_for_server_user(server_id, auth.uid()) & 1) = 1)));


--
-- Name: channels MANAGE_CHANNELS and OWNER can update channels; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "MANAGE_CHANNELS and OWNER can update channels" ON public.channels FOR UPDATE TO authenticated USING ((((public.get_permission_flags_for_server_user(server_id, auth.uid()) & 8) = 8) OR ((public.get_permission_flags_for_server_user(server_id, auth.uid()) & 1) = 1)));


--
-- Name: channel_permissions MANAGE_CHANNELS can add permissions below their highest role; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "MANAGE_CHANNELS can add permissions below their highest role" ON public.channel_permissions FOR INSERT TO authenticated WITH CHECK ((((public.get_permission_flags_for_server_user(( SELECT channels.server_id
   FROM public.channels
  WHERE (channels.channel_id = channels.channel_id)), auth.uid()) & 8) = 8) AND (public.get_highest_role_position_for_user(auth.uid(), ( SELECT channels.server_id
   FROM public.channels
  WHERE (channels.channel_id = channels.channel_id))) > ( SELECT server_roles."position"
   FROM public.server_roles
  WHERE (server_roles.id = channel_permissions.role_id)))));


--
-- Name: channel_permissions MANAGE_CHANNELS can delete perms below their highest role; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "MANAGE_CHANNELS can delete perms below their highest role" ON public.channel_permissions FOR DELETE TO authenticated USING ((((public.get_permission_flags_for_server_user(( SELECT channels.server_id
   FROM public.channels
  WHERE (channels.channel_id = channels.channel_id)), auth.uid()) & 8) = 8) AND (public.get_highest_role_position_for_user(auth.uid(), ( SELECT channels.server_id
   FROM public.channels
  WHERE (channels.channel_id = channels.channel_id))) > ( SELECT server_roles."position"
   FROM public.server_roles
  WHERE (server_roles.id = channel_permissions.role_id)))));


--
-- Name: channel_permissions MANAGE_CHANNELS can modify perms below their highest role; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "MANAGE_CHANNELS can modify perms below their highest role" ON public.channel_permissions FOR UPDATE TO authenticated USING ((((public.get_permission_flags_for_server_user(( SELECT channels.server_id
   FROM public.channels
  WHERE (channels.channel_id = channels.channel_id)), auth.uid()) & 8) = 8) AND (public.get_highest_role_position_for_user(auth.uid(), ( SELECT channels.server_id
   FROM public.channels
  WHERE (channels.channel_id = channels.channel_id))) > ( SELECT server_roles."position"
   FROM public.server_roles
  WHERE (server_roles.id = channel_permissions.role_id)))));


--
-- Name: channels MANAGE_CHANNELS or OWNER permissions can create channels; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "MANAGE_CHANNELS or OWNER permissions can create channels" ON public.channels FOR INSERT TO authenticated WITH CHECK ((((public.get_permission_flags_for_server_user(server_id, auth.uid()) & 8) = 8) OR ((public.get_permission_flags_for_server_user(server_id, auth.uid()) & 1) = 1)));


--
-- Name: server_invites MANAGE_INVITES or OWNER can delete invites; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "MANAGE_INVITES or OWNER can delete invites" ON public.server_invites FOR DELETE TO authenticated USING (( SELECT (((get_permission_flags_for_server_user.get_permission_flags_for_server_user & 256) = 256) OR ((get_permission_flags_for_server_user.get_permission_flags_for_server_user & 1) = 1))
   FROM public.get_permission_flags_for_server_user(server_invites.server_id, auth.uid()) get_permission_flags_for_server_user(get_permission_flags_for_server_user)));


--
-- Name: messages MANAGE_MESSAGES or OWNER can delete messages; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "MANAGE_MESSAGES or OWNER can delete messages" ON public.messages FOR DELETE TO authenticated USING ((((public.get_channel_permission_flags(channel_id) & 1) = 1) OR ((public.get_permission_flags_for_server_user(public.get_server_id_of_message(id), auth.uid()) & 1) = 1)));


--
-- Name: server_user_roles MANAGE_ROLES can add roles below their highest; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "MANAGE_ROLES can add roles below their highest" ON public.server_user_roles FOR INSERT TO authenticated WITH CHECK ((((public.get_permission_flags_for_server_user(( SELECT server_users.server_id
   FROM public.server_users
  WHERE (server_users.id = server_user_roles.server_user_id)), auth.uid()) & 32) = 32) AND (public.get_highest_role_position_for_user(auth.uid(), ( SELECT server_users.server_id
   FROM public.server_users
  WHERE (server_users.id = server_user_roles.server_user_id))) > ( SELECT server_roles."position"
   FROM public.server_roles
  WHERE (server_roles.id = server_user_roles.role_id)))));


--
-- Name: server_roles MANAGE_ROLES can create roles below their highest position; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "MANAGE_ROLES can create roles below their highest position" ON public.server_roles FOR INSERT TO authenticated WITH CHECK ((((public.get_permission_flags_for_server_user(server_id, auth.uid()) & 32) = 32) AND (public.get_highest_role_position_for_user(auth.uid(), server_id) > "position")));


--
-- Name: server_roles MANAGE_ROLES can delete roles below their highest position; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "MANAGE_ROLES can delete roles below their highest position" ON public.server_roles FOR DELETE TO authenticated USING ((((public.get_permission_flags_for_server_user(server_id, auth.uid()) & 32) = 32) AND (public.get_highest_role_position_for_user(auth.uid(), server_id) > "position")));


--
-- Name: server_user_roles MANAGE_ROLES can edit roles below their highest position; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "MANAGE_ROLES can edit roles below their highest position" ON public.server_user_roles FOR UPDATE TO authenticated USING ((((public.get_permission_flags_for_server_user(( SELECT server_users.server_id
   FROM public.server_users
  WHERE (server_users.id = server_user_roles.server_user_id)), auth.uid()) & 32) = 32) AND (public.get_highest_role_position_for_user(auth.uid(), ( SELECT server_users.server_id
   FROM public.server_users
  WHERE (server_users.id = server_user_roles.server_user_id))) > ( SELECT server_roles."position"
   FROM public.server_roles
  WHERE (server_roles.id = server_user_roles.role_id)))));


--
-- Name: server_roles MANAGE_ROLES can modify roles; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "MANAGE_ROLES can modify roles" ON public.server_roles FOR UPDATE TO authenticated USING ((((public.get_permission_flags_for_server_user(server_id, auth.uid()) & 32) = 32) AND (public.get_highest_role_position_for_user(auth.uid(), server_id) > "position")));


--
-- Name: server_user_roles MANAGE_ROLES can remove roles lower than their highest; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "MANAGE_ROLES can remove roles lower than their highest" ON public.server_user_roles FOR DELETE TO authenticated USING ((((public.get_permission_flags_for_server_user(( SELECT server_users.server_id
   FROM public.server_users
  WHERE (server_users.id = server_user_roles.server_user_id)), auth.uid()) & 32) = 32) AND (public.get_highest_role_position_for_user(auth.uid(), ( SELECT server_users.server_id
   FROM public.server_users
  WHERE (server_users.id = server_user_roles.server_user_id))) > ( SELECT server_roles."position"
   FROM public.server_roles
  WHERE (server_roles.id = server_user_roles.role_id)))));


--
-- Name: servers MANAGE_SERVER and OWNER can update server; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "MANAGE_SERVER and OWNER can update server" ON public.servers FOR UPDATE TO authenticated USING (( SELECT (((get_permission_flags_for_server_user.get_permission_flags_for_server_user & 4) = 4) OR ((get_permission_flags_for_server_user.get_permission_flags_for_server_user & 1) = 1))
   FROM public.get_permission_flags_for_server_user(servers.id, auth.uid()) get_permission_flags_for_server_user(get_permission_flags_for_server_user)));


--
-- Name: server_bans MANAGE_USERS and OWNER can remove bans; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "MANAGE_USERS and OWNER can remove bans" ON public.server_bans FOR DELETE TO authenticated USING ((((public.get_permission_flags_for_server_user(server_id, auth.uid()) & 1) = 1) OR ((public.get_permission_flags_for_server_user(server_id, auth.uid()) & 16) = 16)));


--
-- Name: server_bans MANAGE_USERS can ban users below their highest role; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "MANAGE_USERS can ban users below their highest role" ON public.server_bans FOR INSERT TO authenticated WITH CHECK ((((public.get_permission_flags_for_server_user(server_id, auth.uid()) & 16) = 16) AND (public.get_highest_role_position_for_user(auth.uid(), server_id) > public.get_highest_role_position_for_user(profile_id, server_id))));


--
-- Name: server_users MANAGE_USERS can kick users below their highest role; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "MANAGE_USERS can kick users below their highest role" ON public.server_users FOR DELETE TO authenticated USING ((((public.get_permission_flags_for_server_user(server_id, auth.uid()) & 16) = 16) AND (public.get_highest_role_position_for_user(auth.uid(), server_id) > public.get_highest_role_position_for_user(profile_id, server_id))));


--
-- Name: channel_permissions OWNER can add channel permissions; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "OWNER can add channel permissions" ON public.channel_permissions FOR INSERT TO authenticated WITH CHECK (((public.get_permission_flags_for_server_user(( SELECT channels.server_id
   FROM public.channels
  WHERE (channels.channel_id = channels.channel_id)), auth.uid()) & 1) = 1));


--
-- Name: server_user_roles OWNER can add roles to users; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "OWNER can add roles to users" ON public.server_user_roles FOR INSERT TO authenticated WITH CHECK (((public.get_permission_flags_for_server_user(( SELECT server_users.server_id
   FROM public.server_users
  WHERE (server_users.id = server_user_roles.server_user_id)), auth.uid()) & 1) = 1));


--
-- Name: server_bans OWNER can ban users; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "OWNER can ban users" ON public.server_bans FOR INSERT TO authenticated WITH CHECK (((public.get_permission_flags_for_server_user(server_id, auth.uid()) & 1) = 1));


--
-- Name: server_roles OWNER can create roles; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "OWNER can create roles" ON public.server_roles FOR INSERT TO authenticated WITH CHECK (((public.get_permission_flags_for_server_user(server_id, auth.uid()) & 1) = 1));


--
-- Name: channel_permissions OWNER can delete channel permissions; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "OWNER can delete channel permissions" ON public.channel_permissions FOR DELETE TO authenticated USING (((public.get_permission_flags_for_server_user(( SELECT channels.server_id
   FROM public.channels
  WHERE (channels.channel_id = channels.channel_id)), auth.uid()) & 1) = 1));


--
-- Name: server_roles OWNER can delete roles; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "OWNER can delete roles" ON public.server_roles FOR DELETE TO authenticated USING (((public.get_permission_flags_for_server_user(server_id, auth.uid()) & 1) = 1));


--
-- Name: server_user_roles OWNER can edit a user's roles; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "OWNER can edit a user's roles" ON public.server_user_roles FOR UPDATE TO authenticated USING (((public.get_permission_flags_for_server_user(( SELECT server_users.server_id
   FROM public.server_users
  WHERE (server_users.id = server_user_roles.server_user_id)), auth.uid()) & 1) = 1));


--
-- Name: server_roles OWNER can edit roles; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "OWNER can edit roles" ON public.server_roles FOR UPDATE TO authenticated USING (((public.get_permission_flags_for_server_user(server_id, auth.uid()) & 1) = 1));


--
-- Name: server_users OWNER can kick users; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "OWNER can kick users" ON public.server_users FOR DELETE TO authenticated USING (((public.get_permission_flags_for_server_user(server_id, auth.uid()) & 1) = 1));


--
-- Name: channel_permissions OWNER can modify channel permissions; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "OWNER can modify channel permissions" ON public.channel_permissions FOR UPDATE TO authenticated USING (((public.get_permission_flags_for_server_user(( SELECT channels.server_id
   FROM public.channels
  WHERE (channels.channel_id = channels.channel_id)), auth.uid()) & 1) = 1));


--
-- Name: server_user_roles OWNER can remove roles from users; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "OWNER can remove roles from users" ON public.server_user_roles FOR DELETE TO authenticated USING (((public.get_permission_flags_for_server_user(( SELECT server_users.server_id
   FROM public.server_users
  WHERE (server_users.id = server_user_roles.server_user_id)), auth.uid()) & 1) = 1));


--
-- Name: profile_relations Only receipient can modify the status of a friend request; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Only receipient can modify the status of a friend request" ON public.profile_relations FOR UPDATE USING ((auth.uid() = user2));


--
-- Name: servers Only server owners can delete their servers; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Only server owners can delete their servers" ON public.servers FOR DELETE TO authenticated USING (((public.get_permission_flags_for_server_user(id, auth.uid()) & 1) = 1));


--
-- Name: profiles Public profiles are viewable by everyone.; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);


--
-- Name: messages SEND_MESSAGES can send messages; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "SEND_MESSAGES can send messages" ON public.messages FOR INSERT TO authenticated WITH CHECK (((public.get_channel_permission_flags(channel_id) & 2) = 2));


--
-- Name: servers Servers can be fetched by authenticated; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Servers can be fetched by authenticated" ON public.servers FOR SELECT TO authenticated USING (true);


--
-- Name: profile_relations Users can create friendships; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can create friendships" ON public.profile_relations FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user1));


--
-- Name: messages Users can delete their own messages; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can delete their own messages" ON public.messages FOR DELETE TO authenticated USING ((auth.uid() = profile_id));


--
-- Name: messages Users can edit their own messages; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can edit their own messages" ON public.messages FOR UPDATE TO authenticated USING ((auth.uid() = profile_id));


--
-- Name: profile_relations Users can end friendships they're a part of; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can end friendships they're a part of" ON public.profile_relations FOR DELETE TO authenticated USING (((auth.uid() = user1) OR (auth.uid() = user2)));


--
-- Name: profiles Users can insert their own profile.; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK ((auth.uid() = id));


--
-- Name: server_users Users can join servers they're not banned from; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can join servers they're not banned from" ON public.server_users FOR INSERT TO authenticated WITH CHECK ((NOT (EXISTS ( SELECT 1
   FROM public.server_bans
  WHERE ((server_bans.profile_id = server_bans.profile_id) AND (server_bans.server_id = server_bans.server_id))))));


--
-- Name: server_users Users can leave servers; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can leave servers" ON public.server_users FOR DELETE TO authenticated USING ((auth.uid() = profile_id));


--
-- Name: user_plugins Users can only modify items relating to their own profile; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can only modify items relating to their own profile" ON public.user_plugins TO authenticated USING ((auth.uid() = profile_id));


--
-- Name: messages Users can read messages from channels they have access to; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can read messages from channels they have access to" ON public.messages FOR SELECT TO authenticated USING ((public.is_user_in_server(auth.uid(), ( SELECT channels.server_id
   FROM public.channels
  WHERE (channels.channel_id = messages.channel_id))) AND (((( SELECT bit_or(channel_permissions.permissions) AS bit_or
   FROM (public.channel_permissions
     LEFT JOIN public.channels ON ((channels.channel_id = messages.channel_id)))))::integer & 4) = 4)));


--
-- Name: server_users Users can see all users in a server they're in; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can see all users in a server they're in" ON public.server_users FOR SELECT TO authenticated USING (true);


--
-- Name: profiles Users can update own profile.; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING ((auth.uid() = id));


--
-- Name: channel_permissions Users can view permissions on channels; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view permissions on channels" ON public.channel_permissions FOR SELECT TO authenticated USING (true);


--
-- Name: channels Users in server and READ_MESSAGES can view channel; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users in server and READ_MESSAGES can view channel" ON public.channels FOR SELECT TO authenticated USING ((public.is_user_in_server(auth.uid(), server_id) AND ((public.get_channel_permission_flags(channel_id) & 4) = 4)));


--
-- Name: server_roles Users in server can view roles; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users in server can view roles" ON public.server_roles FOR SELECT TO authenticated USING (public.is_user_in_server(auth.uid(), server_id));


--
-- Name: server_user_roles Users in this server can view server user roles; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users in this server can view server user roles" ON public.server_user_roles FOR SELECT USING (public.is_user_in_server(auth.uid(), ( SELECT server_users.server_id
   FROM public.server_users
  WHERE (server_users.id = server_user_roles.server_user_id))));


--
-- Name: profile_relations Users part of a friendship can see their friends; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users part of a friendship can see their friends" ON public.profile_relations FOR SELECT TO authenticated USING (((auth.uid() = user1) OR (auth.uid() = user2)));


--
-- Name: server_invites all users can fetch server invites; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "all users can fetch server invites" ON public.server_invites FOR SELECT TO authenticated USING (true);


--
-- Name: channel_permissions; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.channel_permissions ENABLE ROW LEVEL SECURITY;

--
-- Name: channels; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;

--
-- Name: messages; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

--
-- Name: profile_relations; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.profile_relations ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: server_bans; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.server_bans ENABLE ROW LEVEL SECURITY;

--
-- Name: server_invites; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.server_invites ENABLE ROW LEVEL SECURITY;

--
-- Name: server_roles; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.server_roles ENABLE ROW LEVEL SECURITY;

--
-- Name: server_user_roles; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.server_user_roles ENABLE ROW LEVEL SECURITY;

--
-- Name: server_users; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.server_users ENABLE ROW LEVEL SECURITY;

--
-- Name: servers; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.servers ENABLE ROW LEVEL SECURITY;

--
-- Name: user_plugins; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.user_plugins ENABLE ROW LEVEL SECURITY;

--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT USAGE ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;


--
-- Name: TABLE profile_relations; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.profile_relations TO anon;
GRANT ALL ON TABLE public.profile_relations TO authenticated;
GRANT ALL ON TABLE public.profile_relations TO service_role;


--
-- Name: FUNCTION accept_friend_request(t_p_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.accept_friend_request(t_p_id uuid) TO anon;
GRANT ALL ON FUNCTION public.accept_friend_request(t_p_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.accept_friend_request(t_p_id uuid) TO service_role;


--
-- Name: FUNCTION add_everyone_role_to_new_joins(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.add_everyone_role_to_new_joins() TO anon;
GRANT ALL ON FUNCTION public.add_everyone_role_to_new_joins() TO authenticated;
GRANT ALL ON FUNCTION public.add_everyone_role_to_new_joins() TO service_role;


--
-- Name: FUNCTION create_base_channel_permissions_on_channel_create(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.create_base_channel_permissions_on_channel_create() TO anon;
GRANT ALL ON FUNCTION public.create_base_channel_permissions_on_channel_create() TO authenticated;
GRANT ALL ON FUNCTION public.create_base_channel_permissions_on_channel_create() TO service_role;


--
-- Name: FUNCTION create_dm(t_p_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.create_dm(t_p_id uuid) TO anon;
GRANT ALL ON FUNCTION public.create_dm(t_p_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.create_dm(t_p_id uuid) TO service_role;


--
-- Name: TABLE messages; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.messages TO anon;
GRANT ALL ON TABLE public.messages TO authenticated;
GRANT ALL ON TABLE public.messages TO service_role;


--
-- Name: FUNCTION createmessage(c_id bigint, p_id uuid, content text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.createmessage(c_id bigint, p_id uuid, content text) TO anon;
GRANT ALL ON FUNCTION public.createmessage(c_id bigint, p_id uuid, content text) TO authenticated;
GRANT ALL ON FUNCTION public.createmessage(c_id bigint, p_id uuid, content text) TO service_role;


--
-- Name: FUNCTION "delete_servcrIcons"(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public."delete_servcrIcons"() TO anon;
GRANT ALL ON FUNCTION public."delete_servcrIcons"() TO authenticated;
GRANT ALL ON FUNCTION public."delete_servcrIcons"() TO service_role;


--
-- Name: FUNCTION detailed_profile_relations(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.detailed_profile_relations() TO anon;
GRANT ALL ON FUNCTION public.detailed_profile_relations() TO authenticated;
GRANT ALL ON FUNCTION public.detailed_profile_relations() TO service_role;


--
-- Name: FUNCTION flag_message_edits(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.flag_message_edits() TO anon;
GRANT ALL ON FUNCTION public.flag_message_edits() TO authenticated;
GRANT ALL ON FUNCTION public.flag_message_edits() TO service_role;


--
-- Name: FUNCTION get_all_channels_for_user(p_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_all_channels_for_user(p_id uuid) TO anon;
GRANT ALL ON FUNCTION public.get_all_channels_for_user(p_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.get_all_channels_for_user(p_id uuid) TO service_role;


--
-- Name: FUNCTION get_channel_permission_flags(c_id bigint); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_channel_permission_flags(c_id bigint) TO anon;
GRANT ALL ON FUNCTION public.get_channel_permission_flags(c_id bigint) TO authenticated;
GRANT ALL ON FUNCTION public.get_channel_permission_flags(c_id bigint) TO service_role;


--
-- Name: FUNCTION get_detailed_profile_relation(pr_id bigint); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_detailed_profile_relation(pr_id bigint) TO anon;
GRANT ALL ON FUNCTION public.get_detailed_profile_relation(pr_id bigint) TO authenticated;
GRANT ALL ON FUNCTION public.get_detailed_profile_relation(pr_id bigint) TO service_role;


--
-- Name: FUNCTION get_dm_channel_and_target_profile_by_server_id(s_id bigint); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_dm_channel_and_target_profile_by_server_id(s_id bigint) TO anon;
GRANT ALL ON FUNCTION public.get_dm_channel_and_target_profile_by_server_id(s_id bigint) TO authenticated;
GRANT ALL ON FUNCTION public.get_dm_channel_and_target_profile_by_server_id(s_id bigint) TO service_role;


--
-- Name: FUNCTION get_dm_channels_and_target_profiles(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_dm_channels_and_target_profiles() TO anon;
GRANT ALL ON FUNCTION public.get_dm_channels_and_target_profiles() TO authenticated;
GRANT ALL ON FUNCTION public.get_dm_channels_and_target_profiles() TO service_role;


--
-- Name: FUNCTION get_highest_role_position_for_user(p_id uuid, s_id bigint); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_highest_role_position_for_user(p_id uuid, s_id bigint) TO anon;
GRANT ALL ON FUNCTION public.get_highest_role_position_for_user(p_id uuid, s_id bigint) TO authenticated;
GRANT ALL ON FUNCTION public.get_highest_role_position_for_user(p_id uuid, s_id bigint) TO service_role;


--
-- Name: FUNCTION get_message_with_server_profile(m_id bigint); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_message_with_server_profile(m_id bigint) TO anon;
GRANT ALL ON FUNCTION public.get_message_with_server_profile(m_id bigint) TO authenticated;
GRANT ALL ON FUNCTION public.get_message_with_server_profile(m_id bigint) TO service_role;


--
-- Name: FUNCTION get_messages_in_channel_with_server_profile(c_id bigint); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_messages_in_channel_with_server_profile(c_id bigint) TO anon;
GRANT ALL ON FUNCTION public.get_messages_in_channel_with_server_profile(c_id bigint) TO authenticated;
GRANT ALL ON FUNCTION public.get_messages_in_channel_with_server_profile(c_id bigint) TO service_role;


--
-- Name: FUNCTION get_owner_id_of_server_from_message(m_id bigint); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_owner_id_of_server_from_message(m_id bigint) TO anon;
GRANT ALL ON FUNCTION public.get_owner_id_of_server_from_message(m_id bigint) TO authenticated;
GRANT ALL ON FUNCTION public.get_owner_id_of_server_from_message(m_id bigint) TO service_role;


--
-- Name: FUNCTION get_permission_flags_for_server_user(s_id bigint, p_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_permission_flags_for_server_user(s_id bigint, p_id uuid) TO anon;
GRANT ALL ON FUNCTION public.get_permission_flags_for_server_user(s_id bigint, p_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.get_permission_flags_for_server_user(s_id bigint, p_id uuid) TO service_role;


--
-- Name: FUNCTION get_profile_relationship_by_target_profile_id(t_p_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_profile_relationship_by_target_profile_id(t_p_id uuid) TO anon;
GRANT ALL ON FUNCTION public.get_profile_relationship_by_target_profile_id(t_p_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.get_profile_relationship_by_target_profile_id(t_p_id uuid) TO service_role;


--
-- Name: FUNCTION get_roles_for_user_in_server(p_id uuid, s_id bigint); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_roles_for_user_in_server(p_id uuid, s_id bigint) TO anon;
GRANT ALL ON FUNCTION public.get_roles_for_user_in_server(p_id uuid, s_id bigint) TO authenticated;
GRANT ALL ON FUNCTION public.get_roles_for_user_in_server(p_id uuid, s_id bigint) TO service_role;


--
-- Name: FUNCTION get_server_id_of_message(m_id bigint); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_server_id_of_message(m_id bigint) TO anon;
GRANT ALL ON FUNCTION public.get_server_id_of_message(m_id bigint) TO authenticated;
GRANT ALL ON FUNCTION public.get_server_id_of_message(m_id bigint) TO service_role;


--
-- Name: FUNCTION get_server_profile_for_user(s_id bigint, p_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_server_profile_for_user(s_id bigint, p_id uuid) TO anon;
GRANT ALL ON FUNCTION public.get_server_profile_for_user(s_id bigint, p_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.get_server_profile_for_user(s_id bigint, p_id uuid) TO service_role;


--
-- Name: TABLE servers; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.servers TO anon;
GRANT ALL ON TABLE public.servers TO authenticated;
GRANT ALL ON TABLE public.servers TO service_role;


--
-- Name: FUNCTION get_servers_for_user(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_servers_for_user() TO anon;
GRANT ALL ON FUNCTION public.get_servers_for_user() TO authenticated;
GRANT ALL ON FUNCTION public.get_servers_for_user() TO service_role;


--
-- Name: TABLE profiles; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.profiles TO anon;
GRANT ALL ON TABLE public.profiles TO authenticated;
GRANT ALL ON TABLE public.profiles TO service_role;


--
-- Name: FUNCTION get_users_in_server(s_id bigint); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_users_in_server(s_id bigint) TO anon;
GRANT ALL ON FUNCTION public.get_users_in_server(s_id bigint) TO authenticated;
GRANT ALL ON FUNCTION public.get_users_in_server(s_id bigint) TO service_role;


--
-- Name: FUNCTION handle_new_user(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.handle_new_user() TO anon;
GRANT ALL ON FUNCTION public.handle_new_user() TO authenticated;
GRANT ALL ON FUNCTION public.handle_new_user() TO service_role;


--
-- Name: FUNCTION is_user_in_server(p_id uuid, s_id bigint); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.is_user_in_server(p_id uuid, s_id bigint) TO anon;
GRANT ALL ON FUNCTION public.is_user_in_server(p_id uuid, s_id bigint) TO authenticated;
GRANT ALL ON FUNCTION public.is_user_in_server(p_id uuid, s_id bigint) TO service_role;


--
-- Name: FUNCTION remove_user_from_server_on_ban(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.remove_user_from_server_on_ban() TO anon;
GRANT ALL ON FUNCTION public.remove_user_from_server_on_ban() TO authenticated;
GRANT ALL ON FUNCTION public.remove_user_from_server_on_ban() TO service_role;


--
-- Name: FUNCTION server_create_hook(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.server_create_hook() TO anon;
GRANT ALL ON FUNCTION public.server_create_hook() TO authenticated;
GRANT ALL ON FUNCTION public.server_create_hook() TO service_role;


--
-- Name: TABLE channel_permissions; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.channel_permissions TO anon;
GRANT ALL ON TABLE public.channel_permissions TO authenticated;
GRANT ALL ON TABLE public.channel_permissions TO service_role;


--
-- Name: SEQUENCE channel_permissions_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.channel_permissions_id_seq TO anon;
GRANT ALL ON SEQUENCE public.channel_permissions_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.channel_permissions_id_seq TO service_role;


--
-- Name: TABLE channels; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.channels TO anon;
GRANT ALL ON TABLE public.channels TO authenticated;
GRANT ALL ON TABLE public.channels TO service_role;


--
-- Name: SEQUENCE channels_channel_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.channels_channel_id_seq TO anon;
GRANT ALL ON SEQUENCE public.channels_channel_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.channels_channel_id_seq TO service_role;


--
-- Name: TABLE server_invites; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.server_invites TO anon;
GRANT ALL ON TABLE public.server_invites TO authenticated;
GRANT ALL ON TABLE public.server_invites TO service_role;


--
-- Name: SEQUENCE invites_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.invites_id_seq TO anon;
GRANT ALL ON SEQUENCE public.invites_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.invites_id_seq TO service_role;


--
-- Name: SEQUENCE messages_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.messages_id_seq TO anon;
GRANT ALL ON SEQUENCE public.messages_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.messages_id_seq TO service_role;


--
-- Name: SEQUENCE profile_friends_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.profile_friends_id_seq TO anon;
GRANT ALL ON SEQUENCE public.profile_friends_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.profile_friends_id_seq TO service_role;


--
-- Name: TABLE server_bans; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.server_bans TO anon;
GRANT ALL ON TABLE public.server_bans TO authenticated;
GRANT ALL ON TABLE public.server_bans TO service_role;


--
-- Name: SEQUENCE server_bans_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.server_bans_id_seq TO anon;
GRANT ALL ON SEQUENCE public.server_bans_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.server_bans_id_seq TO service_role;


--
-- Name: TABLE server_roles; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.server_roles TO anon;
GRANT ALL ON TABLE public.server_roles TO authenticated;
GRANT ALL ON TABLE public.server_roles TO service_role;


--
-- Name: SEQUENCE server_roles_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.server_roles_id_seq TO anon;
GRANT ALL ON SEQUENCE public.server_roles_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.server_roles_id_seq TO service_role;


--
-- Name: TABLE server_user_roles; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.server_user_roles TO anon;
GRANT ALL ON TABLE public.server_user_roles TO authenticated;
GRANT ALL ON TABLE public.server_user_roles TO service_role;


--
-- Name: SEQUENCE server_user_roles_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.server_user_roles_id_seq TO anon;
GRANT ALL ON SEQUENCE public.server_user_roles_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.server_user_roles_id_seq TO service_role;


--
-- Name: TABLE server_users; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.server_users TO anon;
GRANT ALL ON TABLE public.server_users TO authenticated;
GRANT ALL ON TABLE public.server_users TO service_role;


--
-- Name: SEQUENCE server_users_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.server_users_id_seq TO anon;
GRANT ALL ON SEQUENCE public.server_users_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.server_users_id_seq TO service_role;


--
-- Name: SEQUENCE servers_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.servers_id_seq TO anon;
GRANT ALL ON SEQUENCE public.servers_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.servers_id_seq TO service_role;


--
-- Name: TABLE user_plugins; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.user_plugins TO anon;
GRANT ALL ON TABLE public.user_plugins TO authenticated;
GRANT ALL ON TABLE public.user_plugins TO service_role;


--
-- Name: SEQUENCE user_plugins_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.user_plugins_id_seq TO anon;
GRANT ALL ON SEQUENCE public.user_plugins_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.user_plugins_id_seq TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES  TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES  TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS  TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS  TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES  TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES  TO service_role;


--
-- PostgreSQL database dump complete
--

-- Realtime publications
ALTER PUBLICATION supabase_realtime ADD TABLE public.servers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.server_users;
ALTER PUBLICATION supabase_realtime ADD TABLE public.server_roles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.server_invites;
ALTER PUBLICATION supabase_realtime ADD TABLE public.server_bans;
ALTER PUBLICATION supabase_realtime ADD TABLE public.server_user_roles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_plugins;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profile_relations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.channels;
ALTER PUBLICATION supabase_realtime ADD TABLE public.channel_permissions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messags;
