--
-- PostgreSQL database dump
--

-- Dumped from database version 15.1
-- Dumped by pg_dump version 15.1 (Debian 15.1-1.pgdg110+1)

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
-- Name: pg_net; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";


--
-- Name: pgsodium; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";


--
-- Name: pg_graphql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";


--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";


--
-- Name: pgjwt; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";


--
-- Name: pgtap; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "pgtap" WITH SCHEMA "extensions";


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";


--
-- Name: add_everyone_role_to_new_joins(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION "public"."add_everyone_role_to_new_joins"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$BEGIN
  INSERT INTO server_user_roles(server_user_id, role_id)
  VALUES (
    new.id,
    (SELECT id FROM server_roles WHERE (server_id = new.server_id AND name = 'EVERYONE' AND server_roles.is_system)) 
  );
  return new;
END;$$;


ALTER FUNCTION "public"."add_everyone_role_to_new_joins"() OWNER TO "postgres";

--
-- Name: create_base_channel_permissions_on_channel_create(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION "public"."create_base_channel_permissions_on_channel_create"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$BEGIN
  -- On the creation of a new channel, we should create some default permissions
  INSERT INTO channel_permissions(channel_id, role_id, permissions)
  VALUES 
    (new.channel_id, (SELECT id FROM server_roles WHERE (server_id = new.server_id AND name = 'OWNER')), 7),
    (new.channel_id, (SELECT id FROM server_roles WHERE (server_id = new.server_id AND name = 'EVERYONE')), 6);

  return new;
END;$$;


ALTER FUNCTION "public"."create_base_channel_permissions_on_channel_create"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";

--
-- Name: messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."messages" (
    "id" bigint NOT NULL,
    "sent_time" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text") NOT NULL,
    "is_edited" boolean DEFAULT false NOT NULL,
    "is_pinned" boolean DEFAULT false NOT NULL,
    "edited_time" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text"),
    "channel_id" bigint NOT NULL,
    "author_id" bigint NOT NULL,
    "content" "text" NOT NULL,
    "profile_id" "uuid" NOT NULL,
    CONSTRAINT "no_empty_str" CHECK (("content" <> ''::"text"))
);


ALTER TABLE "public"."messages" OWNER TO "postgres";

--
-- Name: createmessage(bigint, "uuid", "text"); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION "public"."createmessage"("c_id" bigint, "p_id" "uuid", "content" "text") RETURNS SETOF "public"."messages"
    LANGUAGE "plpgsql"
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
END
$$;


ALTER FUNCTION "public"."createmessage"("c_id" bigint, "p_id" "uuid", "content" "text") OWNER TO "postgres";

--
-- Name: flag_message_edits(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION "public"."flag_message_edits"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$BEGIN
  new.is_edited := new.content != old.content;
  return new;
END;$$;


ALTER FUNCTION "public"."flag_message_edits"() OWNER TO "postgres";

--
-- Name: get_all_channels_for_user("uuid"); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION "public"."get_all_channels_for_user"("p_id" "uuid") RETURNS TABLE("channel_id" integer)
    LANGUAGE "sql"
    AS $$
  SELECT c.channel_id FROM channels c LEFT JOIN (
    SELECT server_id 
    FROM server_users 
    WHERE profile_id=p_id
  ) AS su ON c.server_id=su.server_id
$$;


ALTER FUNCTION "public"."get_all_channels_for_user"("p_id" "uuid") OWNER TO "postgres";

--
-- Name: get_channel_permission_flags(bigint); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION "public"."get_channel_permission_flags"("c_id" bigint) RETURNS integer
    LANGUAGE "sql" IMMUTABLE
    AS $$SELECT BIT_OR(permissions)
FROM channel_permissions 
LEFT JOIN server_user_roles ON (server_user_roles.role_id = channel_permissions.role_id)
LEFT JOIN server_users ON (server_users.id = server_user_roles.server_user_id)
WHERE channel_id = c_id AND server_users.profile_id = auth.uid()
$$;


ALTER FUNCTION "public"."get_channel_permission_flags"("c_id" bigint) OWNER TO "postgres";

--
-- Name: get_highest_role_position_for_user("uuid", bigint); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION "public"."get_highest_role_position_for_user"("p_id" "uuid", "s_id" bigint) RETURNS integer
    LANGUAGE "sql" IMMUTABLE
    AS $$SELECT server_roles.position 
FROM server_user_roles 
LEFT JOIN server_roles 
ON (server_roles.id = server_user_roles.role_id)
WHERE (server_roles.server_id = s_id AND server_user_roles.server_user_id = (
  SELECT id FROM server_users WHERE (server_id = server_roles.server_id AND profile_id = p_id)
))
ORDER BY server_roles.position DESC
LIMIT 1;$$;


ALTER FUNCTION "public"."get_highest_role_position_for_user"("p_id" "uuid", "s_id" bigint) OWNER TO "postgres";

--
-- Name: get_owner_id_of_server_from_message(bigint); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION "public"."get_owner_id_of_server_from_message"("m_id" bigint) RETURNS "uuid"
    LANGUAGE "sql"
    AS $$SELECT profile_id from server_users WHERE (is_owner AND server_id = (
  SELECT id FROM servers WHERE (id = (
    SELECT server_id FROM channels WHERE (channel_id = (
      SELECT channel_id FROM messages WHERE (id = m_id)
    ))
  ))
));$$;


ALTER FUNCTION "public"."get_owner_id_of_server_from_message"("m_id" bigint) OWNER TO "postgres";

--
-- Name: get_permission_flags_for_server_user(bigint, "uuid"); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION "public"."get_permission_flags_for_server_user"("s_id" bigint, "p_id" "uuid") RETURNS integer
    LANGUAGE "sql" IMMUTABLE
    AS $$SELECT bit_or(server_roles.permissions) 
FROM server_user_roles 
LEFT JOIN server_roles 
ON (server_user_roles.role_id = server_roles.id) 
WHERE (server_user_id = (
  SELECT id 
  FROM server_users 
  WHERE (server_id = s_id AND profile_id = p_id)
))$$;


ALTER FUNCTION "public"."get_permission_flags_for_server_user"("s_id" bigint, "p_id" "uuid") OWNER TO "postgres";

--
-- Name: get_roles_for_user_in_server("uuid", bigint); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION "public"."get_roles_for_user_in_server"("p_id" "uuid", "s_id" bigint) RETURNS "void"
    LANGUAGE "sql" IMMUTABLE
    AS $$
SELECT server_roles.id, server_roles.name, server_roles.permissions, server_roles.color, server_roles.is_system, server_roles.position FROM server_roles
LEFT JOIN server_user_roles ON (server_user_roles.role_id = server_roles.id)
LEFT JOIN server_users ON (server_user_roles.server_user_id = server_users.id)
WHERE server_users.profile_id = p_id AND server_users.server_id = s_id$$;


ALTER FUNCTION "public"."get_roles_for_user_in_server"("p_id" "uuid", "s_id" bigint) OWNER TO "postgres";

--
-- Name: get_server_id_of_message(bigint); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION "public"."get_server_id_of_message"("m_id" bigint) RETURNS bigint
    LANGUAGE "sql" IMMUTABLE
    AS $$SELECT id FROM servers WHERE (id = (
    SELECT server_id FROM channels LEFT JOIN messages ON (messages.channel_id = channels.channel_id) WHERE (messages.id = m_id)
))$$;


ALTER FUNCTION "public"."get_server_id_of_message"("m_id" bigint) OWNER TO "postgres";

--
-- Name: servers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."servers" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text"),
    "name" "text" NOT NULL,
    "description" "text",
    "image_url" "text",
    CONSTRAINT "no_empty_name" CHECK ((TRIM(BOTH FROM "name") <> ''::"text"))
);


ALTER TABLE "public"."servers" OWNER TO "postgres";

--
-- Name: get_servers_for_user(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION "public"."get_servers_for_user"() RETURNS SETOF "public"."servers"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN QUERY SELECT * FROM servers WHERE is_user_in_server(auth.uid(), server_id);
END;
$$;


ALTER FUNCTION "public"."get_servers_for_user"() OWNER TO "postgres";

--
-- Name: profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."profiles" (
    "id" "uuid" NOT NULL,
    "updated_at" timestamp with time zone,
    "username" "text" NOT NULL,
    "full_name" "text",
    "avatar_url" "text",
    "website" "text",
    "email" "text" NOT NULL,
    CONSTRAINT "username_length" CHECK (("char_length"("username") >= 3))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";

--
-- Name: get_users_in_server(bigint); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION "public"."get_users_in_server"("s_id" bigint) RETURNS SETOF "public"."profiles"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN QUERY SELECT * FROM profiles WHERE id IN (
    SELECT profile_id FROM server_users WHERE server_id = s_id
  );
END;
$$;


ALTER FUNCTION "public"."get_users_in_server"("s_id" bigint) OWNER TO "postgres";

--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  insert into public.profiles (id, full_name, avatar_url, email, username)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', new.email, new.raw_user_meta_data->>'username' );
  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";

--
-- Name: is_user_in_server("uuid", bigint); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION "public"."is_user_in_server"("p_id" "uuid", "s_id" bigint) RETURNS boolean
    LANGUAGE "sql" IMMUTABLE
    AS $$SELECT EXISTS (
  SELECT 1 FROM server_users WHERE (p_id = profile_id AND s_id = server_id)
);$$;


ALTER FUNCTION "public"."is_user_in_server"("p_id" "uuid", "s_id" bigint) OWNER TO "postgres";

--
-- Name: remove_user_from_server_on_ban(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION "public"."remove_user_from_server_on_ban"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$BEGIN
  DELETE FROM server_users WHERE (
      profile_id = new.profile_id
      AND server_id = new.server_id
  );
  return new;
END;$$;


ALTER FUNCTION "public"."remove_user_from_server_on_ban"() OWNER TO "postgres";

--
-- Name: server_create_hook(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION "public"."server_create_hook"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$BEGIN
  -- Next, we need to create the roles
  INSERT INTO server_roles(name, permissions, server_id, is_system, position)
  VALUES ('OWNER', 1, new.id, TRUE, 32767), ('EVERYONE', 256, new.id, TRUE, 0);

  -- Before we do anything, we need to add the user to server_users
  INSERT INTO server_users (profile_id, server_id) 
  VALUES (auth.uid(), new.id);

  -- Now let's add the general channel
  INSERT INTO channels(name, server_id) VALUES ('general', new.id);

  -- Now that the roles are made, we can assign the owner their OWNER role
  INSERT INTO server_user_roles(server_user_id, role_id)
  VALUES (
    (SELECT id FROM server_users WHERE (profile_id = auth.uid() AND server_id = new.id)),
    (SELECT id FROM server_roles WHERE (server_id = new.id AND name = 'OWNER'))
  );

  return new;
END;$$;


ALTER FUNCTION "public"."server_create_hook"() OWNER TO "postgres";

--
-- Name: channel_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."channel_permissions" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text") NOT NULL,
    "role_id" bigint NOT NULL,
    "permissions" smallint DEFAULT '6'::smallint NOT NULL,
    "channel_id" bigint NOT NULL
);


ALTER TABLE "public"."channel_permissions" OWNER TO "postgres";

--
-- Name: channel_permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE "public"."channel_permissions" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."channel_permissions_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: channels; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."channels" (
    "created_at" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text"),
    "name" "text" NOT NULL,
    "channel_id" bigint NOT NULL,
    "server_id" bigint NOT NULL,
    "description" "text",
    "is_media" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."channels" OWNER TO "postgres";

--
-- Name: channels_channel_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE "public"."channels" ALTER COLUMN "channel_id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."channels_channel_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: direct_message_channels; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."direct_message_channels" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text") NOT NULL,
    "owner_id" "uuid" NOT NULL,
    "recepient_id" "uuid" NOT NULL
);


ALTER TABLE "public"."direct_message_channels" OWNER TO "postgres";

--
-- Name: direct_message_channels_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE "public"."direct_message_channels" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."direct_message_channels_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: direct_messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."direct_messages" (
    "id" bigint NOT NULL,
    "sent_time" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text") NOT NULL,
    "is_edited" boolean DEFAULT false NOT NULL,
    "is_pinned" boolean DEFAULT false NOT NULL,
    "edited_time" timestamp with time zone,
    "direct_message_id" bigint NOT NULL,
    "author_id" "uuid" NOT NULL,
    "content" "text" NOT NULL
);


ALTER TABLE "public"."direct_messages" OWNER TO "postgres";

--
-- Name: direct_message_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE "public"."direct_messages" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."direct_message_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: server_invites; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."server_invites" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text"),
    "expires_at" timestamp with time zone,
    "uses_remaining" bigint,
    "url_id" "text" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "server_id" bigint NOT NULL
);


ALTER TABLE "public"."server_invites" OWNER TO "postgres";

--
-- Name: invites_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE "public"."server_invites" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."invites_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: messages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE "public"."messages" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."messages_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: server_bans; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."server_bans" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text") NOT NULL,
    "profile_id" "uuid" NOT NULL,
    "server_id" bigint NOT NULL,
    "reason" "text" DEFAULT ''::"text" NOT NULL
);


ALTER TABLE "public"."server_bans" OWNER TO "postgres";

--
-- Name: server_bans_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE "public"."server_bans" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."server_bans_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: server_roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."server_roles" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text"),
    "name" "text" DEFAULT ''::"text" NOT NULL,
    "permissions" integer DEFAULT 0 NOT NULL,
    "server_id" bigint NOT NULL,
    "color" character varying(7),
    "is_system" boolean DEFAULT false NOT NULL,
    "position" smallint NOT NULL
);


ALTER TABLE "public"."server_roles" OWNER TO "postgres";

--
-- Name: server_roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE "public"."server_roles" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."server_roles_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: server_user_roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."server_user_roles" (
    "id" bigint NOT NULL,
    "server_user_id" bigint NOT NULL,
    "role_id" bigint NOT NULL
);


ALTER TABLE "public"."server_user_roles" OWNER TO "postgres";

--
-- Name: server_user_roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE "public"."server_user_roles" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."server_user_roles_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: server_users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."server_users" (
    "joined_at" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text"),
    "nickname" "text",
    "profile_id" "uuid" NOT NULL,
    "server_id" bigint NOT NULL,
    "id" bigint NOT NULL
);


ALTER TABLE "public"."server_users" OWNER TO "postgres";

--
-- Name: server_users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE "public"."server_users" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."server_users_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: servers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE "public"."servers" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."servers_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: user_plugins; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."user_plugins" (
    "id" bigint NOT NULL,
    "profile_id" "uuid" NOT NULL,
    "source_url" "text" NOT NULL,
    "is_enabled" boolean DEFAULT false NOT NULL,
    "settings_data" "json" DEFAULT '{}'::"json" NOT NULL
);


ALTER TABLE "public"."user_plugins" OWNER TO "postgres";

--
-- Name: user_plugins_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE "public"."user_plugins" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."user_plugins_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: channel_permissions channel_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."channel_permissions"
    ADD CONSTRAINT "channel_permissions_pkey" PRIMARY KEY ("id");


--
-- Name: channels channels_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."channels"
    ADD CONSTRAINT "channels_pkey" PRIMARY KEY ("channel_id");


--
-- Name: direct_message_channels direct_message_channels_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."direct_message_channels"
    ADD CONSTRAINT "direct_message_channels_pkey" PRIMARY KEY ("id");


--
-- Name: direct_messages direct_message_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."direct_messages"
    ADD CONSTRAINT "direct_message_pkey" PRIMARY KEY ("id");


--
-- Name: server_invites invites_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."server_invites"
    ADD CONSTRAINT "invites_pkey" PRIMARY KEY ("id");


--
-- Name: server_invites invites_url_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."server_invites"
    ADD CONSTRAINT "invites_url_id_key" UNIQUE ("url_id");


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_pkey" PRIMARY KEY ("id");


--
-- Name: profiles profiles_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_email_key" UNIQUE ("email");


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");


--
-- Name: profiles profiles_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_username_key" UNIQUE ("username");


--
-- Name: server_bans server_bans_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."server_bans"
    ADD CONSTRAINT "server_bans_pkey" PRIMARY KEY ("id");


--
-- Name: server_roles server_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."server_roles"
    ADD CONSTRAINT "server_roles_pkey" PRIMARY KEY ("id");


--
-- Name: server_user_roles server_user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."server_user_roles"
    ADD CONSTRAINT "server_user_roles_pkey" PRIMARY KEY ("id");


--
-- Name: server_users server_users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."server_users"
    ADD CONSTRAINT "server_users_pkey" PRIMARY KEY ("id");


--
-- Name: servers servers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."servers"
    ADD CONSTRAINT "servers_pkey" PRIMARY KEY ("id");


--
-- Name: user_plugins user_plugins_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."user_plugins"
    ADD CONSTRAINT "user_plugins_pkey" PRIMARY KEY ("id");


--
-- Name: server_users add_everyone_role_to_new_joins; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER "add_everyone_role_to_new_joins" AFTER INSERT ON "public"."server_users" FOR EACH ROW EXECUTE FUNCTION "public"."add_everyone_role_to_new_joins"();


--
-- Name: channels create_base_channel_permissions_on_channel_create; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER "create_base_channel_permissions_on_channel_create" AFTER INSERT ON "public"."channels" FOR EACH ROW EXECUTE FUNCTION "public"."create_base_channel_permissions_on_channel_create"();


--
-- Name: messages flag_message_edits; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER "flag_message_edits" BEFORE UPDATE ON "public"."messages" FOR EACH ROW EXECUTE FUNCTION "public"."flag_message_edits"();


--
-- Name: server_bans remove_user_from_server_on_ban; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER "remove_user_from_server_on_ban" AFTER INSERT ON "public"."server_bans" FOR EACH ROW EXECUTE FUNCTION "public"."remove_user_from_server_on_ban"();


--
-- Name: servers server_create_hook; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER "server_create_hook" AFTER INSERT ON "public"."servers" FOR EACH ROW EXECUTE FUNCTION "public"."server_create_hook"();


--
-- Name: channel_permissions channel_permissions_channel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."channel_permissions"
    ADD CONSTRAINT "channel_permissions_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "public"."channels"("channel_id") ON DELETE CASCADE;


--
-- Name: channel_permissions channel_permissions_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."channel_permissions"
    ADD CONSTRAINT "channel_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."server_roles"("id");


--
-- Name: channels channels_server_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."channels"
    ADD CONSTRAINT "channels_server_id_fkey" FOREIGN KEY ("server_id") REFERENCES "public"."servers"("id") ON DELETE CASCADE;


--
-- Name: direct_message_channels direct_message_channels_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."direct_message_channels"
    ADD CONSTRAINT "direct_message_channels_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;


--
-- Name: direct_message_channels direct_message_channels_recepient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."direct_message_channels"
    ADD CONSTRAINT "direct_message_channels_recepient_id_fkey" FOREIGN KEY ("recepient_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;


--
-- Name: direct_messages direct_messages_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."direct_messages"
    ADD CONSTRAINT "direct_messages_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."profiles"("id");


--
-- Name: direct_messages direct_messages_direct_message_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."direct_messages"
    ADD CONSTRAINT "direct_messages_direct_message_id_fkey" FOREIGN KEY ("direct_message_id") REFERENCES "public"."direct_message_channels"("id") ON DELETE CASCADE;


--
-- Name: messages messages_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."server_users"("id") ON DELETE CASCADE;


--
-- Name: messages messages_channel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "public"."channels"("channel_id") ON DELETE CASCADE;


--
-- Name: messages messages_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;


--
-- Name: server_bans server_bans_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."server_bans"
    ADD CONSTRAINT "server_bans_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;


--
-- Name: server_bans server_bans_server_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."server_bans"
    ADD CONSTRAINT "server_bans_server_id_fkey" FOREIGN KEY ("server_id") REFERENCES "public"."servers"("id") ON DELETE CASCADE;


--
-- Name: server_invites server_invites_server_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."server_invites"
    ADD CONSTRAINT "server_invites_server_id_fkey" FOREIGN KEY ("server_id") REFERENCES "public"."servers"("id") ON DELETE CASCADE;


--
-- Name: server_roles server_roles_server_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."server_roles"
    ADD CONSTRAINT "server_roles_server_id_fkey" FOREIGN KEY ("server_id") REFERENCES "public"."servers"("id") ON DELETE CASCADE;


--
-- Name: server_user_roles server_user_roles_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."server_user_roles"
    ADD CONSTRAINT "server_user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."server_roles"("id") ON DELETE CASCADE;


--
-- Name: server_user_roles server_user_roles_server_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."server_user_roles"
    ADD CONSTRAINT "server_user_roles_server_user_id_fkey" FOREIGN KEY ("server_user_id") REFERENCES "public"."server_users"("id") ON DELETE CASCADE;


--
-- Name: server_users server_users_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."server_users"
    ADD CONSTRAINT "server_users_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;


--
-- Name: server_users server_users_server_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."server_users"
    ADD CONSTRAINT "server_users_server_id_fkey" FOREIGN KEY ("server_id") REFERENCES "public"."servers"("id") ON DELETE CASCADE;


--
-- Name: user_plugins user_plugins_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."user_plugins"
    ADD CONSTRAINT "user_plugins_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id");


--
-- Name: server_invites CREATE_INVITES or OWNER permissions can create invites; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "CREATE_INVITES or OWNER permissions can create invites" ON "public"."server_invites" FOR INSERT TO "authenticated" WITH CHECK (( SELECT ((("get_permission_flags_for_server_user"."get_permission_flags_for_server_user" & 256) = 256) OR (("get_permission_flags_for_server_user"."get_permission_flags_for_server_user" & 1) = 1))
   FROM "public"."get_permission_flags_for_server_user"("server_invites"."server_id", "auth"."uid"()) "get_permission_flags_for_server_user"("get_permission_flags_for_server_user")));


--
-- Name: direct_message_channels Enable insert for authenticated users only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable insert for authenticated users only" ON "public"."direct_message_channels" FOR INSERT TO "authenticated" WITH CHECK (true);


--
-- Name: direct_messages Enable insert for authenticated users only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable insert for authenticated users only" ON "public"."direct_messages" FOR INSERT TO "authenticated" WITH CHECK (true);


--
-- Name: servers Enable insert for authenticated users only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable insert for authenticated users only" ON "public"."servers" FOR INSERT TO "authenticated" WITH CHECK (true);


--
-- Name: channels MANAGE_CHANNELS and OWNER can delete channels; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "MANAGE_CHANNELS and OWNER can delete channels" ON "public"."channels" FOR DELETE TO "authenticated" USING (((("public"."get_permission_flags_for_server_user"("server_id", "auth"."uid"()) & 8) = 8) OR (("public"."get_permission_flags_for_server_user"("server_id", "auth"."uid"()) & 1) = 1)));


--
-- Name: channels MANAGE_CHANNELS and OWNER can update channels; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "MANAGE_CHANNELS and OWNER can update channels" ON "public"."channels" FOR UPDATE TO "authenticated" USING (((("public"."get_permission_flags_for_server_user"("server_id", "auth"."uid"()) & 8) = 8) OR (("public"."get_permission_flags_for_server_user"("server_id", "auth"."uid"()) & 1) = 1)));


--
-- Name: channel_permissions MANAGE_CHANNELS can add permissions below their highest role; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "MANAGE_CHANNELS can add permissions below their highest role" ON "public"."channel_permissions" FOR INSERT TO "authenticated" WITH CHECK (((("public"."get_permission_flags_for_server_user"(( SELECT "channels"."server_id"
   FROM "public"."channels"
  WHERE ("channels"."channel_id" = "channels"."channel_id")), "auth"."uid"()) & 8) = 8) AND ("public"."get_highest_role_position_for_user"("auth"."uid"(), ( SELECT "channels"."server_id"
   FROM "public"."channels"
  WHERE ("channels"."channel_id" = "channels"."channel_id"))) > ( SELECT "server_roles"."position"
   FROM "public"."server_roles"
  WHERE ("server_roles"."id" = "channel_permissions"."role_id")))));


--
-- Name: channel_permissions MANAGE_CHANNELS can delete perms below their highest role; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "MANAGE_CHANNELS can delete perms below their highest role" ON "public"."channel_permissions" FOR DELETE TO "authenticated" USING (((("public"."get_permission_flags_for_server_user"(( SELECT "channels"."server_id"
   FROM "public"."channels"
  WHERE ("channels"."channel_id" = "channels"."channel_id")), "auth"."uid"()) & 8) = 8) AND ("public"."get_highest_role_position_for_user"("auth"."uid"(), ( SELECT "channels"."server_id"
   FROM "public"."channels"
  WHERE ("channels"."channel_id" = "channels"."channel_id"))) > ( SELECT "server_roles"."position"
   FROM "public"."server_roles"
  WHERE ("server_roles"."id" = "channel_permissions"."role_id")))));


--
-- Name: channel_permissions MANAGE_CHANNELS can modify perms below their highest role; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "MANAGE_CHANNELS can modify perms below their highest role" ON "public"."channel_permissions" FOR UPDATE TO "authenticated" USING (((("public"."get_permission_flags_for_server_user"(( SELECT "channels"."server_id"
   FROM "public"."channels"
  WHERE ("channels"."channel_id" = "channels"."channel_id")), "auth"."uid"()) & 8) = 8) AND ("public"."get_highest_role_position_for_user"("auth"."uid"(), ( SELECT "channels"."server_id"
   FROM "public"."channels"
  WHERE ("channels"."channel_id" = "channels"."channel_id"))) > ( SELECT "server_roles"."position"
   FROM "public"."server_roles"
  WHERE ("server_roles"."id" = "channel_permissions"."role_id")))));


--
-- Name: channels MANAGE_CHANNELS or OWNER permissions can create channels; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "MANAGE_CHANNELS or OWNER permissions can create channels" ON "public"."channels" FOR INSERT TO "authenticated" WITH CHECK (((("public"."get_permission_flags_for_server_user"("server_id", "auth"."uid"()) & 8) = 8) OR (("public"."get_permission_flags_for_server_user"("server_id", "auth"."uid"()) & 1) = 1)));


--
-- Name: server_invites MANAGE_INVITES or OWNER can delete invites; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "MANAGE_INVITES or OWNER can delete invites" ON "public"."server_invites" FOR DELETE TO "authenticated" USING (( SELECT ((("get_permission_flags_for_server_user"."get_permission_flags_for_server_user" & 256) = 256) OR (("get_permission_flags_for_server_user"."get_permission_flags_for_server_user" & 1) = 1))
   FROM "public"."get_permission_flags_for_server_user"("server_invites"."server_id", "auth"."uid"()) "get_permission_flags_for_server_user"("get_permission_flags_for_server_user")));


--
-- Name: messages MANAGE_MESSAGES or OWNER can delete messages; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "MANAGE_MESSAGES or OWNER can delete messages" ON "public"."messages" FOR DELETE TO "authenticated" USING (((("public"."get_channel_permission_flags"("channel_id") & 1) = 1) OR (("public"."get_permission_flags_for_server_user"("public"."get_server_id_of_message"("id"), "auth"."uid"()) & 1) = 1)));


--
-- Name: server_user_roles MANAGE_ROLES can add roles below their highest; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "MANAGE_ROLES can add roles below their highest" ON "public"."server_user_roles" FOR INSERT TO "authenticated" WITH CHECK (((("public"."get_permission_flags_for_server_user"(( SELECT "server_users"."server_id"
   FROM "public"."server_users"
  WHERE ("server_users"."id" = "server_user_roles"."server_user_id")), "auth"."uid"()) & 32) = 32) AND ("public"."get_highest_role_position_for_user"("auth"."uid"(), ( SELECT "server_users"."server_id"
   FROM "public"."server_users"
  WHERE ("server_users"."id" = "server_user_roles"."server_user_id"))) > ( SELECT "server_roles"."position"
   FROM "public"."server_roles"
  WHERE ("server_roles"."id" = "server_user_roles"."role_id")))));


--
-- Name: server_roles MANAGE_ROLES can create roles below their highest position; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "MANAGE_ROLES can create roles below their highest position" ON "public"."server_roles" FOR INSERT TO "authenticated" WITH CHECK (((("public"."get_permission_flags_for_server_user"("server_id", "auth"."uid"()) & 32) = 32) AND ("public"."get_highest_role_position_for_user"("auth"."uid"(), "server_id") > "position")));


--
-- Name: server_roles MANAGE_ROLES can delete roles below their highest position; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "MANAGE_ROLES can delete roles below their highest position" ON "public"."server_roles" FOR DELETE TO "authenticated" USING (((("public"."get_permission_flags_for_server_user"("server_id", "auth"."uid"()) & 32) = 32) AND ("public"."get_highest_role_position_for_user"("auth"."uid"(), "server_id") > "position")));


--
-- Name: server_user_roles MANAGE_ROLES can edit roles below their highest position; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "MANAGE_ROLES can edit roles below their highest position" ON "public"."server_user_roles" FOR UPDATE TO "authenticated" USING (((("public"."get_permission_flags_for_server_user"(( SELECT "server_users"."server_id"
   FROM "public"."server_users"
  WHERE ("server_users"."id" = "server_user_roles"."server_user_id")), "auth"."uid"()) & 32) = 32) AND ("public"."get_highest_role_position_for_user"("auth"."uid"(), ( SELECT "server_users"."server_id"
   FROM "public"."server_users"
  WHERE ("server_users"."id" = "server_user_roles"."server_user_id"))) > ( SELECT "server_roles"."position"
   FROM "public"."server_roles"
  WHERE ("server_roles"."id" = "server_user_roles"."role_id")))));


--
-- Name: server_roles MANAGE_ROLES can modify roles; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "MANAGE_ROLES can modify roles" ON "public"."server_roles" FOR UPDATE TO "authenticated" USING (((("public"."get_permission_flags_for_server_user"("server_id", "auth"."uid"()) & 32) = 32) AND ("public"."get_highest_role_position_for_user"("auth"."uid"(), "server_id") > "position")));


--
-- Name: server_user_roles MANAGE_ROLES can remove roles lower than their highest; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "MANAGE_ROLES can remove roles lower than their highest" ON "public"."server_user_roles" FOR DELETE TO "authenticated" USING (((("public"."get_permission_flags_for_server_user"(( SELECT "server_users"."server_id"
   FROM "public"."server_users"
  WHERE ("server_users"."id" = "server_user_roles"."server_user_id")), "auth"."uid"()) & 32) = 32) AND ("public"."get_highest_role_position_for_user"("auth"."uid"(), ( SELECT "server_users"."server_id"
   FROM "public"."server_users"
  WHERE ("server_users"."id" = "server_user_roles"."server_user_id"))) > ( SELECT "server_roles"."position"
   FROM "public"."server_roles"
  WHERE ("server_roles"."id" = "server_user_roles"."role_id")))));


--
-- Name: servers MANAGE_SERVER and OWNER can update server; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "MANAGE_SERVER and OWNER can update server" ON "public"."servers" FOR UPDATE TO "authenticated" USING (( SELECT ((("get_permission_flags_for_server_user"."get_permission_flags_for_server_user" & 4) = 4) OR (("get_permission_flags_for_server_user"."get_permission_flags_for_server_user" & 1) = 1))
   FROM "public"."get_permission_flags_for_server_user"("servers"."id", "auth"."uid"()) "get_permission_flags_for_server_user"("get_permission_flags_for_server_user")));


--
-- Name: server_bans MANAGE_USERS and OWNER can remove bans; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "MANAGE_USERS and OWNER can remove bans" ON "public"."server_bans" FOR DELETE TO "authenticated" USING (((("public"."get_permission_flags_for_server_user"("server_id", "auth"."uid"()) & 1) = 1) OR (("public"."get_permission_flags_for_server_user"("server_id", "auth"."uid"()) & 16) = 16)));


--
-- Name: server_bans MANAGE_USERS can ban users below their highest role; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "MANAGE_USERS can ban users below their highest role" ON "public"."server_bans" FOR INSERT TO "authenticated" WITH CHECK (((("public"."get_permission_flags_for_server_user"("server_id", "auth"."uid"()) & 16) = 16) AND ("public"."get_highest_role_position_for_user"("auth"."uid"(), "server_id") > "public"."get_highest_role_position_for_user"("profile_id", "server_id"))));


--
-- Name: server_users MANAGE_USERS can kick users below their highest role; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "MANAGE_USERS can kick users below their highest role" ON "public"."server_users" FOR DELETE TO "authenticated" USING (((("public"."get_permission_flags_for_server_user"("server_id", "auth"."uid"()) & 16) = 16) AND ("public"."get_highest_role_position_for_user"("auth"."uid"(), "server_id") > "public"."get_highest_role_position_for_user"("profile_id", "server_id"))));


--
-- Name: channel_permissions OWNER can add channel permissions; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "OWNER can add channel permissions" ON "public"."channel_permissions" FOR INSERT TO "authenticated" WITH CHECK ((("public"."get_permission_flags_for_server_user"(( SELECT "channels"."server_id"
   FROM "public"."channels"
  WHERE ("channels"."channel_id" = "channels"."channel_id")), "auth"."uid"()) & 1) = 1));


--
-- Name: server_user_roles OWNER can add roles to users; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "OWNER can add roles to users" ON "public"."server_user_roles" FOR INSERT TO "authenticated" WITH CHECK ((("public"."get_permission_flags_for_server_user"(( SELECT "server_users"."server_id"
   FROM "public"."server_users"
  WHERE ("server_users"."id" = "server_user_roles"."server_user_id")), "auth"."uid"()) & 1) = 1));


--
-- Name: server_bans OWNER can ban users; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "OWNER can ban users" ON "public"."server_bans" FOR INSERT TO "authenticated" WITH CHECK ((("public"."get_permission_flags_for_server_user"("server_id", "auth"."uid"()) & 1) = 1));


--
-- Name: server_roles OWNER can create roles; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "OWNER can create roles" ON "public"."server_roles" FOR INSERT TO "authenticated" WITH CHECK ((("public"."get_permission_flags_for_server_user"("server_id", "auth"."uid"()) & 1) = 1));


--
-- Name: channel_permissions OWNER can delete channel permissions; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "OWNER can delete channel permissions" ON "public"."channel_permissions" FOR DELETE TO "authenticated" USING ((("public"."get_permission_flags_for_server_user"(( SELECT "channels"."server_id"
   FROM "public"."channels"
  WHERE ("channels"."channel_id" = "channels"."channel_id")), "auth"."uid"()) & 1) = 1));


--
-- Name: server_roles OWNER can delete roles; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "OWNER can delete roles" ON "public"."server_roles" FOR DELETE TO "authenticated" USING ((("public"."get_permission_flags_for_server_user"("server_id", "auth"."uid"()) & 1) = 1));


--
-- Name: server_user_roles OWNER can edit a user's roles; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "OWNER can edit a user's roles" ON "public"."server_user_roles" FOR UPDATE TO "authenticated" USING ((("public"."get_permission_flags_for_server_user"(( SELECT "server_users"."server_id"
   FROM "public"."server_users"
  WHERE ("server_users"."id" = "server_user_roles"."server_user_id")), "auth"."uid"()) & 1) = 1));


--
-- Name: server_roles OWNER can edit roles; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "OWNER can edit roles" ON "public"."server_roles" FOR UPDATE TO "authenticated" USING ((("public"."get_permission_flags_for_server_user"("server_id", "auth"."uid"()) & 1) = 1));


--
-- Name: server_users OWNER can kick users; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "OWNER can kick users" ON "public"."server_users" FOR DELETE TO "authenticated" USING ((("public"."get_permission_flags_for_server_user"("server_id", "auth"."uid"()) & 1) = 1));


--
-- Name: channel_permissions OWNER can modify channel permissions; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "OWNER can modify channel permissions" ON "public"."channel_permissions" FOR UPDATE TO "authenticated" USING ((("public"."get_permission_flags_for_server_user"(( SELECT "channels"."server_id"
   FROM "public"."channels"
  WHERE ("channels"."channel_id" = "channels"."channel_id")), "auth"."uid"()) & 1) = 1));


--
-- Name: server_user_roles OWNER can remove roles from users; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "OWNER can remove roles from users" ON "public"."server_user_roles" FOR DELETE TO "authenticated" USING ((("public"."get_permission_flags_for_server_user"(( SELECT "server_users"."server_id"
   FROM "public"."server_users"
  WHERE ("server_users"."id" = "server_user_roles"."server_user_id")), "auth"."uid"()) & 1) = 1));


--
-- Name: servers Only server owners can delete their servers; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Only server owners can delete their servers" ON "public"."servers" FOR DELETE TO "authenticated" USING ((("public"."get_permission_flags_for_server_user"("id", "auth"."uid"()) & 1) = 1));


--
-- Name: profiles Public profiles are viewable by everyone.; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Public profiles are viewable by everyone." ON "public"."profiles" FOR SELECT USING (true);


--
-- Name: messages SEND_MESSAGES can send messages; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "SEND_MESSAGES can send messages" ON "public"."messages" FOR INSERT TO "authenticated" WITH CHECK ((("public"."get_channel_permission_flags"("channel_id") & 2) = 2));


--
-- Name: servers Servers can be fetched by authenticated; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Servers can be fetched by authenticated" ON "public"."servers" FOR SELECT TO "authenticated" USING (true);


--
-- Name: messages Users can delete their own messages; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can delete their own messages" ON "public"."messages" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "profile_id"));


--
-- Name: messages Users can edit their own messages; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can edit their own messages" ON "public"."messages" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "profile_id"));


--
-- Name: profiles Users can insert their own profile.; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can insert their own profile." ON "public"."profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));


--
-- Name: server_users Users can join servers they're not banned from; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can join servers they're not banned from" ON "public"."server_users" FOR INSERT TO "authenticated" WITH CHECK ((NOT (EXISTS ( SELECT 1
   FROM "public"."server_bans"
  WHERE (("server_bans"."profile_id" = "server_bans"."profile_id") AND ("server_bans"."server_id" = "server_bans"."server_id"))))));


--
-- Name: server_users Users can leave servers; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can leave servers" ON "public"."server_users" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "profile_id"));


--
-- Name: user_plugins Users can only modify items relating to their own profile; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can only modify items relating to their own profile" ON "public"."user_plugins" TO "authenticated" USING (("auth"."uid"() = "profile_id"));


--
-- Name: messages Users can read messages from channels they have access to; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can read messages from channels they have access to" ON "public"."messages" FOR SELECT TO "authenticated" USING (("public"."is_user_in_server"("auth"."uid"(), ( SELECT "channels"."server_id"
   FROM "public"."channels"
  WHERE ("channels"."channel_id" = "messages"."channel_id"))) AND (((( SELECT "bit_or"("channel_permissions"."permissions") AS "bit_or"
   FROM ("public"."channel_permissions"
     LEFT JOIN "public"."channels" ON (("channels"."channel_id" = "messages"."channel_id")))))::integer & 4) = 4)));


--
-- Name: server_users Users can see all users in a server they're in; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can see all users in a server they're in" ON "public"."server_users" FOR SELECT TO "authenticated" USING (true);


--
-- Name: profiles Users can update own profile.; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can update own profile." ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));


--
-- Name: channel_permissions Users can view permissions on channels; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view permissions on channels" ON "public"."channel_permissions" FOR SELECT TO "authenticated" USING (true);


--
-- Name: channels Users in server and READ_MESSAGES can view channel; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users in server and READ_MESSAGES can view channel" ON "public"."channels" FOR SELECT TO "authenticated" USING (("public"."is_user_in_server"("auth"."uid"(), "server_id") AND (("public"."get_channel_permission_flags"("channel_id") & 4) = 4)));


--
-- Name: server_roles Users in server can view roles; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users in server can view roles" ON "public"."server_roles" FOR SELECT TO "authenticated" USING ("public"."is_user_in_server"("auth"."uid"(), "server_id"));


--
-- Name: server_user_roles Users in this server can view server user roles; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users in this server can view server user roles" ON "public"."server_user_roles" FOR SELECT USING ("public"."is_user_in_server"("auth"."uid"(), ( SELECT "server_users"."server_id"
   FROM "public"."server_users"
  WHERE ("server_users"."id" = "server_user_roles"."server_user_id"))));


--
-- Name: server_invites all users can fetch server invites; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "all users can fetch server invites" ON "public"."server_invites" FOR SELECT TO "authenticated" USING (true);


--
-- Name: channel_permissions; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."channel_permissions" ENABLE ROW LEVEL SECURITY;

--
-- Name: channels; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."channels" ENABLE ROW LEVEL SECURITY;

--
-- Name: direct_message_channels; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."direct_message_channels" ENABLE ROW LEVEL SECURITY;

--
-- Name: direct_messages; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."direct_messages" ENABLE ROW LEVEL SECURITY;

--
-- Name: messages; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."messages" ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;

--
-- Name: server_bans; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."server_bans" ENABLE ROW LEVEL SECURITY;

--
-- Name: server_invites; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."server_invites" ENABLE ROW LEVEL SECURITY;

--
-- Name: server_roles; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."server_roles" ENABLE ROW LEVEL SECURITY;

--
-- Name: server_user_roles; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."server_user_roles" ENABLE ROW LEVEL SECURITY;

--
-- Name: server_users; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."server_users" ENABLE ROW LEVEL SECURITY;

--
-- Name: servers; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."servers" ENABLE ROW LEVEL SECURITY;

--
-- Name: user_plugins; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."user_plugins" ENABLE ROW LEVEL SECURITY;

--
-- Name: SCHEMA "net"; Type: ACL; Schema: -; Owner: postgres
--

-- REVOKE ALL ON SCHEMA "net" FROM "supabase_admin";
-- REVOKE ALL ON SCHEMA "net" FROM "postgres";
-- GRANT ALL ON SCHEMA "net" TO "postgres";
-- GRANT USAGE ON SCHEMA "net" TO "supabase_functions_admin";
-- GRANT USAGE ON SCHEMA "net" TO "anon";
-- GRANT USAGE ON SCHEMA "net" TO "authenticated";
-- GRANT USAGE ON SCHEMA "net" TO "service_role";


--
-- Name: SCHEMA "pgsodium_masks"; Type: ACL; Schema: -; Owner: postgres
--

-- REVOKE ALL ON SCHEMA "pgsodium_masks" FROM "supabase_admin";
-- REVOKE USAGE ON SCHEMA "pgsodium_masks" FROM "pgsodium_keyiduser";
-- GRANT ALL ON SCHEMA "pgsodium_masks" TO "postgres";
-- GRANT USAGE ON SCHEMA "pgsodium_masks" TO "pgsodium_keyiduser";


--
-- Name: SCHEMA "public"; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";


--
-- Name: FUNCTION "algorithm_sign"("signables" "text", "secret" "text", "algorithm" "text"); Type: ACL; Schema: extensions; Owner: postgres
--

-- GRANT ALL ON FUNCTION "extensions"."algorithm_sign"("signables" "text", "secret" "text", "algorithm" "text") TO "dashboard_user";


--
-- Name: FUNCTION "armor"("bytea"); Type: ACL; Schema: extensions; Owner: postgres
--

-- GRANT ALL ON FUNCTION "extensions"."armor"("bytea") TO "dashboard_user";


--
-- Name: FUNCTION "armor"("bytea", "text"[], "text"[]); Type: ACL; Schema: extensions; Owner: postgres
--

-- GRANT ALL ON FUNCTION "extensions"."armor"("bytea", "text"[], "text"[]) TO "dashboard_user";


--
-- Name: FUNCTION "crypt"("text", "text"); Type: ACL; Schema: extensions; Owner: postgres
--

-- GRANT ALL ON FUNCTION "extensions"."crypt"("text", "text") TO "dashboard_user";


--
-- Name: FUNCTION "dearmor"("text"); Type: ACL; Schema: extensions; Owner: postgres
--

-- GRANT ALL ON FUNCTION "extensions"."dearmor"("text") TO "dashboard_user";


--
-- Name: FUNCTION "decrypt"("bytea", "bytea", "text"); Type: ACL; Schema: extensions; Owner: postgres
--

-- GRANT ALL ON FUNCTION "extensions"."decrypt"("bytea", "bytea", "text") TO "dashboard_user";


--
-- Name: FUNCTION "decrypt_iv"("bytea", "bytea", "bytea", "text"); Type: ACL; Schema: extensions; Owner: postgres
--

-- GRANT ALL ON FUNCTION "extensions"."decrypt_iv"("bytea", "bytea", "bytea", "text") TO "dashboard_user";


--
-- Name: FUNCTION "digest"("bytea", "text"); Type: ACL; Schema: extensions; Owner: postgres
--

-- GRANT ALL ON FUNCTION "extensions"."digest"("bytea", "text") TO "dashboard_user";


--
-- Name: FUNCTION "digest"("text", "text"); Type: ACL; Schema: extensions; Owner: postgres
--

-- GRANT ALL ON FUNCTION "extensions"."digest"("text", "text") TO "dashboard_user";


--
-- Name: FUNCTION "encrypt"("bytea", "bytea", "text"); Type: ACL; Schema: extensions; Owner: postgres
--

-- GRANT ALL ON FUNCTION "extensions"."encrypt"("bytea", "bytea", "text") TO "dashboard_user";


--
-- Name: FUNCTION "encrypt_iv"("bytea", "bytea", "bytea", "text"); Type: ACL; Schema: extensions; Owner: postgres
--

-- GRANT ALL ON FUNCTION "extensions"."encrypt_iv"("bytea", "bytea", "bytea", "text") TO "dashboard_user";


--
-- Name: FUNCTION "gen_random_bytes"(integer); Type: ACL; Schema: extensions; Owner: postgres
--

-- GRANT ALL ON FUNCTION "extensions"."gen_random_bytes"(integer) TO "dashboard_user";


--
-- Name: FUNCTION "gen_random_uuid"(); Type: ACL; Schema: extensions; Owner: postgres
--

-- GRANT ALL ON FUNCTION "extensions"."gen_random_uuid"() TO "dashboard_user";


--
-- Name: FUNCTION "gen_salt"("text"); Type: ACL; Schema: extensions; Owner: postgres
--

-- GRANT ALL ON FUNCTION "extensions"."gen_salt"("text") TO "dashboard_user";


--
-- Name: FUNCTION "gen_salt"("text", integer); Type: ACL; Schema: extensions; Owner: postgres
--

-- GRANT ALL ON FUNCTION "extensions"."gen_salt"("text", integer) TO "dashboard_user";


--
-- Name: FUNCTION "hmac"("bytea", "bytea", "text"); Type: ACL; Schema: extensions; Owner: postgres
--

-- GRANT ALL ON FUNCTION "extensions"."hmac"("bytea", "bytea", "text") TO "dashboard_user";


--
-- Name: FUNCTION "hmac"("text", "text", "text"); Type: ACL; Schema: extensions; Owner: postgres
--

-- GRANT ALL ON FUNCTION "extensions"."hmac"("text", "text", "text") TO "dashboard_user";


--
-- Name: FUNCTION "pg_stat_statements"("showtext" boolean, OUT "userid" "oid", OUT "dbid" "oid", OUT "toplevel" boolean, OUT "queryid" bigint, OUT "query" "text", OUT "plans" bigint, OUT "total_plan_time" double precision, OUT "min_plan_time" double precision, OUT "max_plan_time" double precision, OUT "mean_plan_time" double precision, OUT "stddev_plan_time" double precision, OUT "calls" bigint, OUT "total_exec_time" double precision, OUT "min_exec_time" double precision, OUT "max_exec_time" double precision, OUT "mean_exec_time" double precision, OUT "stddev_exec_time" double precision, OUT "rows" bigint, OUT "shared_blks_hit" bigint, OUT "shared_blks_read" bigint, OUT "shared_blks_dirtied" bigint, OUT "shared_blks_written" bigint, OUT "local_blks_hit" bigint, OUT "local_blks_read" bigint, OUT "local_blks_dirtied" bigint, OUT "local_blks_written" bigint, OUT "temp_blks_read" bigint, OUT "temp_blks_written" bigint, OUT "blk_read_time" double precision, OUT "blk_write_time" double precision, OUT "temp_blk_read_time" double precision, OUT "temp_blk_write_time" double precision, OUT "wal_records" bigint, OUT "wal_fpi" bigint, OUT "wal_bytes" numeric, OUT "jit_functions" bigint, OUT "jit_generation_time" double precision, OUT "jit_inlining_count" bigint, OUT "jit_inlining_time" double precision, OUT "jit_optimization_count" bigint, OUT "jit_optimization_time" double precision, OUT "jit_emission_count" bigint, OUT "jit_emission_time" double precision); Type: ACL; Schema: extensions; Owner: postgres
--

-- GRANT ALL ON FUNCTION "extensions"."pg_stat_statements"("showtext" boolean, OUT "userid" "oid", OUT "dbid" "oid", OUT "toplevel" boolean, OUT "queryid" bigint, OUT "query" "text", OUT "plans" bigint, OUT "total_plan_time" double precision, OUT "min_plan_time" double precision, OUT "max_plan_time" double precision, OUT "mean_plan_time" double precision, OUT "stddev_plan_time" double precision, OUT "calls" bigint, OUT "total_exec_time" double precision, OUT "min_exec_time" double precision, OUT "max_exec_time" double precision, OUT "mean_exec_time" double precision, OUT "stddev_exec_time" double precision, OUT "rows" bigint, OUT "shared_blks_hit" bigint, OUT "shared_blks_read" bigint, OUT "shared_blks_dirtied" bigint, OUT "shared_blks_written" bigint, OUT "local_blks_hit" bigint, OUT "local_blks_read" bigint, OUT "local_blks_dirtied" bigint, OUT "local_blks_written" bigint, OUT "temp_blks_read" bigint, OUT "temp_blks_written" bigint, OUT "blk_read_time" double precision, OUT "blk_write_time" double precision, OUT "temp_blk_read_time" double precision, OUT "temp_blk_write_time" double precision, OUT "wal_records" bigint, OUT "wal_fpi" bigint, OUT "wal_bytes" numeric, OUT "jit_functions" bigint, OUT "jit_generation_time" double precision, OUT "jit_inlining_count" bigint, OUT "jit_inlining_time" double precision, OUT "jit_optimization_count" bigint, OUT "jit_optimization_time" double precision, OUT "jit_emission_count" bigint, OUT "jit_emission_time" double precision) TO "dashboard_user";


--
-- Name: FUNCTION "pg_stat_statements_info"(OUT "dealloc" bigint, OUT "stats_reset" timestamp with time zone); Type: ACL; Schema: extensions; Owner: postgres
--

-- GRANT ALL ON FUNCTION "extensions"."pg_stat_statements_info"(OUT "dealloc" bigint, OUT "stats_reset" timestamp with time zone) TO "dashboard_user";


--
-- Name: FUNCTION "pg_stat_statements_reset"("userid" "oid", "dbid" "oid", "queryid" bigint); Type: ACL; Schema: extensions; Owner: postgres
--

-- GRANT ALL ON FUNCTION "extensions"."pg_stat_statements_reset"("userid" "oid", "dbid" "oid", "queryid" bigint) TO "dashboard_user";


--
-- Name: FUNCTION "pgp_armor_headers"("text", OUT "key" "text", OUT "value" "text"); Type: ACL; Schema: extensions; Owner: postgres
--

-- GRANT ALL ON FUNCTION "extensions"."pgp_armor_headers"("text", OUT "key" "text", OUT "value" "text") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_key_id"("bytea"); Type: ACL; Schema: extensions; Owner: postgres
--

-- GRANT ALL ON FUNCTION "extensions"."pgp_key_id"("bytea") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_pub_decrypt"("bytea", "bytea"); Type: ACL; Schema: extensions; Owner: postgres
--

-- GRANT ALL ON FUNCTION "extensions"."pgp_pub_decrypt"("bytea", "bytea") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_pub_decrypt"("bytea", "bytea", "text"); Type: ACL; Schema: extensions; Owner: postgres
--

-- GRANT ALL ON FUNCTION "extensions"."pgp_pub_decrypt"("bytea", "bytea", "text") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_pub_decrypt"("bytea", "bytea", "text", "text"); Type: ACL; Schema: extensions; Owner: postgres
--

-- GRANT ALL ON FUNCTION "extensions"."pgp_pub_decrypt"("bytea", "bytea", "text", "text") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_pub_decrypt_bytea"("bytea", "bytea"); Type: ACL; Schema: extensions; Owner: postgres
--

-- GRANT ALL ON FUNCTION "extensions"."pgp_pub_decrypt_bytea"("bytea", "bytea") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_pub_decrypt_bytea"("bytea", "bytea", "text"); Type: ACL; Schema: extensions; Owner: postgres
--

-- GRANT ALL ON FUNCTION "extensions"."pgp_pub_decrypt_bytea"("bytea", "bytea", "text") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_pub_decrypt_bytea"("bytea", "bytea", "text", "text"); Type: ACL; Schema: extensions; Owner: postgres
--

-- GRANT ALL ON FUNCTION "extensions"."pgp_pub_decrypt_bytea"("bytea", "bytea", "text", "text") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_pub_encrypt"("text", "bytea"); Type: ACL; Schema: extensions; Owner: postgres
--

-- GRANT ALL ON FUNCTION "extensions"."pgp_pub_encrypt"("text", "bytea") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_pub_encrypt"("text", "bytea", "text"); Type: ACL; Schema: extensions; Owner: postgres
--

-- GRANT ALL ON FUNCTION "extensions"."pgp_pub_encrypt"("text", "bytea", "text") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_pub_encrypt_bytea"("bytea", "bytea"); Type: ACL; Schema: extensions; Owner: postgres
--

-- GRANT ALL ON FUNCTION "extensions"."pgp_pub_encrypt_bytea"("bytea", "bytea") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_pub_encrypt_bytea"("bytea", "bytea", "text"); Type: ACL; Schema: extensions; Owner: postgres
--

-- GRANT ALL ON FUNCTION "extensions"."pgp_pub_encrypt_bytea"("bytea", "bytea", "text") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_sym_decrypt"("bytea", "text"); Type: ACL; Schema: extensions; Owner: postgres
--

-- GRANT ALL ON FUNCTION "extensions"."pgp_sym_decrypt"("bytea", "text") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_sym_decrypt"("bytea", "text", "text"); Type: ACL; Schema: extensions; Owner: postgres
--

-- GRANT ALL ON FUNCTION "extensions"."pgp_sym_decrypt"("bytea", "text", "text") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_sym_decrypt_bytea"("bytea", "text"); Type: ACL; Schema: extensions; Owner: postgres
--

-- GRANT ALL ON FUNCTION "extensions"."pgp_sym_decrypt_bytea"("bytea", "text") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_sym_decrypt_bytea"("bytea", "text", "text"); Type: ACL; Schema: extensions; Owner: postgres
--

-- GRANT ALL ON FUNCTION "extensions"."pgp_sym_decrypt_bytea"("bytea", "text", "text") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_sym_encrypt"("text", "text"); Type: ACL; Schema: extensions; Owner: postgres
--

-- GRANT ALL ON FUNCTION "extensions"."pgp_sym_encrypt"("text", "text") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_sym_encrypt"("text", "text", "text"); Type: ACL; Schema: extensions; Owner: postgres
--

-- GRANT ALL ON FUNCTION "extensions"."pgp_sym_encrypt"("text", "text", "text") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_sym_encrypt_bytea"("bytea", "text"); Type: ACL; Schema: extensions; Owner: postgres
--

-- GRANT ALL ON FUNCTION "extensions"."pgp_sym_encrypt_bytea"("bytea", "text") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_sym_encrypt_bytea"("bytea", "text", "text"); Type: ACL; Schema: extensions; Owner: postgres
--

-- GRANT ALL ON FUNCTION "extensions"."pgp_sym_encrypt_bytea"("bytea", "text", "text") TO "dashboard_user";


--
-- Name: FUNCTION "sign"("payload" "json", "secret" "text", "algorithm" "text"); Type: ACL; Schema: extensions; Owner: postgres
--

-- GRANT ALL ON FUNCTION "extensions"."sign"("payload" "json", "secret" "text", "algorithm" "text") TO "dashboard_user";


--
-- Name: FUNCTION "try_cast_double"("inp" "text"); Type: ACL; Schema: extensions; Owner: postgres
--

-- GRANT ALL ON FUNCTION "extensions"."try_cast_double"("inp" "text") TO "dashboard_user";


--
-- Name: FUNCTION "url_decode"("data" "text"); Type: ACL; Schema: extensions; Owner: postgres
--

-- GRANT ALL ON FUNCTION "extensions"."url_decode"("data" "text") TO "dashboard_user";


--
-- Name: FUNCTION "url_encode"("data" "bytea"); Type: ACL; Schema: extensions; Owner: postgres
--

-- GRANT ALL ON FUNCTION "extensions"."url_encode"("data" "bytea") TO "dashboard_user";


--
-- Name: FUNCTION "uuid_generate_v1"(); Type: ACL; Schema: extensions; Owner: postgres
--

-- GRANT ALL ON FUNCTION "extensions"."uuid_generate_v1"() TO "dashboard_user";


--
-- Name: FUNCTION "uuid_generate_v1mc"(); Type: ACL; Schema: extensions; Owner: postgres
--

-- GRANT ALL ON FUNCTION "extensions"."uuid_generate_v1mc"() TO "dashboard_user";


--
-- Name: FUNCTION "uuid_generate_v3"("namespace" "uuid", "name" "text"); Type: ACL; Schema: extensions; Owner: postgres
--

-- GRANT ALL ON FUNCTION "extensions"."uuid_generate_v3"("namespace" "uuid", "name" "text") TO "dashboard_user";


--
-- Name: FUNCTION "uuid_generate_v4"(); Type: ACL; Schema: extensions; Owner: postgres
--

-- GRANT ALL ON FUNCTION "extensions"."uuid_generate_v4"() TO "dashboard_user";


--
-- Name: FUNCTION "uuid_generate_v5"("namespace" "uuid", "name" "text"); Type: ACL; Schema: extensions; Owner: postgres
--

-- GRANT ALL ON FUNCTION "extensions"."uuid_generate_v5"("namespace" "uuid", "name" "text") TO "dashboard_user";


--
-- Name: FUNCTION "uuid_nil"(); Type: ACL; Schema: extensions; Owner: postgres
--

-- GRANT ALL ON FUNCTION "extensions"."uuid_nil"() TO "dashboard_user";


--
-- Name: FUNCTION "uuid_ns_dns"(); Type: ACL; Schema: extensions; Owner: postgres
--

-- GRANT ALL ON FUNCTION "extensions"."uuid_ns_dns"() TO "dashboard_user";


--
-- Name: FUNCTION "uuid_ns_oid"(); Type: ACL; Schema: extensions; Owner: postgres
--

-- GRANT ALL ON FUNCTION "extensions"."uuid_ns_oid"() TO "dashboard_user";


--
-- Name: FUNCTION "uuid_ns_url"(); Type: ACL; Schema: extensions; Owner: postgres
--

-- GRANT ALL ON FUNCTION "extensions"."uuid_ns_url"() TO "dashboard_user";


--
-- Name: FUNCTION "uuid_ns_x500"(); Type: ACL; Schema: extensions; Owner: postgres
--

-- GRANT ALL ON FUNCTION "extensions"."uuid_ns_x500"() TO "dashboard_user";


--
-- Name: FUNCTION "verify"("token" "text", "secret" "text", "algorithm" "text"); Type: ACL; Schema: extensions; Owner: postgres
--

-- GRANT ALL ON FUNCTION "extensions"."verify"("token" "text", "secret" "text", "algorithm" "text") TO "dashboard_user";


--
-- Name: FUNCTION "comment_directive"("comment_" "text"); Type: ACL; Schema: graphql; Owner: supabase_admin
--

-- GRANT ALL ON FUNCTION "graphql"."comment_directive"("comment_" "text") TO "postgres";
-- GRANT ALL ON FUNCTION "graphql"."comment_directive"("comment_" "text") TO "anon";
-- GRANT ALL ON FUNCTION "graphql"."comment_directive"("comment_" "text") TO "authenticated";
-- GRANT ALL ON FUNCTION "graphql"."comment_directive"("comment_" "text") TO "service_role";


--
-- Name: FUNCTION "exception"("message" "text"); Type: ACL; Schema: graphql; Owner: supabase_admin
--

-- GRANT ALL ON FUNCTION "graphql"."exception"("message" "text") TO "postgres";
-- GRANT ALL ON FUNCTION "graphql"."exception"("message" "text") TO "anon";
-- GRANT ALL ON FUNCTION "graphql"."exception"("message" "text") TO "authenticated";
-- GRANT ALL ON FUNCTION "graphql"."exception"("message" "text") TO "service_role";


--
-- Name: FUNCTION "get_schema_version"(); Type: ACL; Schema: graphql; Owner: supabase_admin
--

-- GRANT ALL ON FUNCTION "graphql"."get_schema_version"() TO "postgres";
-- GRANT ALL ON FUNCTION "graphql"."get_schema_version"() TO "anon";
-- GRANT ALL ON FUNCTION "graphql"."get_schema_version"() TO "authenticated";
-- GRANT ALL ON FUNCTION "graphql"."get_schema_version"() TO "service_role";


--
-- Name: FUNCTION "increment_schema_version"(); Type: ACL; Schema: graphql; Owner: supabase_admin
--

-- GRANT ALL ON FUNCTION "graphql"."increment_schema_version"() TO "postgres";
-- GRANT ALL ON FUNCTION "graphql"."increment_schema_version"() TO "anon";
-- GRANT ALL ON FUNCTION "graphql"."increment_schema_version"() TO "authenticated";
-- GRANT ALL ON FUNCTION "graphql"."increment_schema_version"() TO "service_role";


--
-- Name: FUNCTION "graphql"("operationName" "text", "query" "text", "variables" "jsonb", "extensions" "jsonb"); Type: ACL; Schema: graphql_public; Owner: supabase_admin
--

-- GRANT ALL ON FUNCTION "graphql_public"."graphql"("operationName" "text", "query" "text", "variables" "jsonb", "extensions" "jsonb") TO "postgres";
-- GRANT ALL ON FUNCTION "graphql_public"."graphql"("operationName" "text", "query" "text", "variables" "jsonb", "extensions" "jsonb") TO "anon";
-- GRANT ALL ON FUNCTION "graphql_public"."graphql"("operationName" "text", "query" "text", "variables" "jsonb", "extensions" "jsonb") TO "authenticated";
-- GRANT ALL ON FUNCTION "graphql_public"."graphql"("operationName" "text", "query" "text", "variables" "jsonb", "extensions" "jsonb") TO "service_role";


--
-- Name: FUNCTION "http_get"("url" "text", "params" "jsonb", "headers" "jsonb", "timeout_milliseconds" integer); Type: ACL; Schema: net; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "net"."http_get"("url" "text", "params" "jsonb", "headers" "jsonb", "timeout_milliseconds" integer) FROM PUBLIC;
-- GRANT ALL ON FUNCTION "net"."http_get"("url" "text", "params" "jsonb", "headers" "jsonb", "timeout_milliseconds" integer) TO "supabase_functions_admin";
-- GRANT ALL ON FUNCTION "net"."http_get"("url" "text", "params" "jsonb", "headers" "jsonb", "timeout_milliseconds" integer) TO "anon";
-- GRANT ALL ON FUNCTION "net"."http_get"("url" "text", "params" "jsonb", "headers" "jsonb", "timeout_milliseconds" integer) TO "authenticated";
-- GRANT ALL ON FUNCTION "net"."http_get"("url" "text", "params" "jsonb", "headers" "jsonb", "timeout_milliseconds" integer) TO "service_role";


--
-- Name: FUNCTION "http_post"("url" "text", "body" "jsonb", "params" "jsonb", "headers" "jsonb", "timeout_milliseconds" integer); Type: ACL; Schema: net; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "net"."http_post"("url" "text", "body" "jsonb", "params" "jsonb", "headers" "jsonb", "timeout_milliseconds" integer) FROM PUBLIC;
-- GRANT ALL ON FUNCTION "net"."http_post"("url" "text", "body" "jsonb", "params" "jsonb", "headers" "jsonb", "timeout_milliseconds" integer) TO "supabase_functions_admin";
-- GRANT ALL ON FUNCTION "net"."http_post"("url" "text", "body" "jsonb", "params" "jsonb", "headers" "jsonb", "timeout_milliseconds" integer) TO "anon";
-- GRANT ALL ON FUNCTION "net"."http_post"("url" "text", "body" "jsonb", "params" "jsonb", "headers" "jsonb", "timeout_milliseconds" integer) TO "authenticated";
-- GRANT ALL ON FUNCTION "net"."http_post"("url" "text", "body" "jsonb", "params" "jsonb", "headers" "jsonb", "timeout_milliseconds" integer) TO "service_role";


--
-- Name: TABLE "key"; Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON TABLE "pgsodium"."key" FROM "supabase_admin";
-- REVOKE ALL ON TABLE "pgsodium"."key" FROM "pgsodium_keymaker";
-- GRANT ALL ON TABLE "pgsodium"."key" TO "postgres";
-- GRANT ALL ON TABLE "pgsodium"."key" TO "pgsodium_keymaker";


--
-- Name: TABLE "valid_key"; Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON TABLE "pgsodium"."valid_key" FROM "supabase_admin";
-- REVOKE ALL ON TABLE "pgsodium"."valid_key" FROM "pgsodium_keyholder";
-- REVOKE SELECT ON TABLE "pgsodium"."valid_key" FROM "pgsodium_keyiduser";
-- GRANT ALL ON TABLE "pgsodium"."valid_key" TO "postgres";
-- GRANT ALL ON TABLE "pgsodium"."valid_key" TO "pgsodium_keyholder";
-- GRANT SELECT ON TABLE "pgsodium"."valid_key" TO "pgsodium_keyiduser";


--
-- Name: FUNCTION "crypto_aead_det_decrypt"("ciphertext" "bytea", "additional" "bytea", "key" "bytea", "nonce" "bytea"); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_aead_det_decrypt"("ciphertext" "bytea", "additional" "bytea", "key" "bytea", "nonce" "bytea") FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_aead_det_decrypt"("ciphertext" "bytea", "additional" "bytea", "key" "bytea", "nonce" "bytea") FROM "pgsodium_keyholder";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_aead_det_decrypt"("ciphertext" "bytea", "additional" "bytea", "key" "bytea", "nonce" "bytea") TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_aead_det_decrypt"("ciphertext" "bytea", "additional" "bytea", "key" "bytea", "nonce" "bytea") TO "pgsodium_keyholder";


--
-- Name: FUNCTION "crypto_aead_det_decrypt"("message" "bytea", "additional" "bytea", "key_uuid" "uuid", "nonce" "bytea"); Type: ACL; Schema: pgsodium; Owner: pgsodium_keymaker
--

-- GRANT ALL ON FUNCTION "pgsodium"."crypto_aead_det_decrypt"("message" "bytea", "additional" "bytea", "key_uuid" "uuid", "nonce" "bytea") TO "service_role";


--
-- Name: FUNCTION "crypto_aead_det_decrypt"("message" "bytea", "additional" "bytea", "key_id" bigint, "context" "bytea", "nonce" "bytea"); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_aead_det_decrypt"("message" "bytea", "additional" "bytea", "key_id" bigint, "context" "bytea", "nonce" "bytea") FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_aead_det_decrypt"("message" "bytea", "additional" "bytea", "key_id" bigint, "context" "bytea", "nonce" "bytea") FROM "pgsodium_keyiduser";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_aead_det_decrypt"("message" "bytea", "additional" "bytea", "key_id" bigint, "context" "bytea", "nonce" "bytea") TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_aead_det_decrypt"("message" "bytea", "additional" "bytea", "key_id" bigint, "context" "bytea", "nonce" "bytea") TO "pgsodium_keyiduser";


--
-- Name: FUNCTION "crypto_aead_det_encrypt"("message" "bytea", "additional" "bytea", "key" "bytea", "nonce" "bytea"); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_aead_det_encrypt"("message" "bytea", "additional" "bytea", "key" "bytea", "nonce" "bytea") FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_aead_det_encrypt"("message" "bytea", "additional" "bytea", "key" "bytea", "nonce" "bytea") FROM "pgsodium_keyholder";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_aead_det_encrypt"("message" "bytea", "additional" "bytea", "key" "bytea", "nonce" "bytea") TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_aead_det_encrypt"("message" "bytea", "additional" "bytea", "key" "bytea", "nonce" "bytea") TO "pgsodium_keyholder";


--
-- Name: FUNCTION "crypto_aead_det_encrypt"("message" "bytea", "additional" "bytea", "key_uuid" "uuid", "nonce" "bytea"); Type: ACL; Schema: pgsodium; Owner: pgsodium_keymaker
--

-- GRANT ALL ON FUNCTION "pgsodium"."crypto_aead_det_encrypt"("message" "bytea", "additional" "bytea", "key_uuid" "uuid", "nonce" "bytea") TO "service_role";


--
-- Name: FUNCTION "crypto_aead_det_encrypt"("message" "bytea", "additional" "bytea", "key_id" bigint, "context" "bytea", "nonce" "bytea"); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_aead_det_encrypt"("message" "bytea", "additional" "bytea", "key_id" bigint, "context" "bytea", "nonce" "bytea") FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_aead_det_encrypt"("message" "bytea", "additional" "bytea", "key_id" bigint, "context" "bytea", "nonce" "bytea") FROM "pgsodium_keyiduser";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_aead_det_encrypt"("message" "bytea", "additional" "bytea", "key_id" bigint, "context" "bytea", "nonce" "bytea") TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_aead_det_encrypt"("message" "bytea", "additional" "bytea", "key_id" bigint, "context" "bytea", "nonce" "bytea") TO "pgsodium_keyiduser";


--
-- Name: FUNCTION "crypto_aead_det_keygen"(); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_aead_det_keygen"() FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_aead_det_keygen"() FROM "pgsodium_keymaker";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_aead_det_keygen"() TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_aead_det_keygen"() TO "pgsodium_keymaker";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_aead_det_keygen"() TO "service_role";


--
-- Name: FUNCTION "crypto_aead_det_noncegen"(); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_aead_det_noncegen"() FROM PUBLIC;
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_aead_det_noncegen"() FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_aead_det_noncegen"() FROM "pgsodium_keyiduser";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_aead_det_noncegen"() TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_aead_det_noncegen"() TO PUBLIC;
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_aead_det_noncegen"() TO "pgsodium_keyiduser";


--
-- Name: FUNCTION "crypto_aead_ietf_decrypt"("message" "bytea", "additional" "bytea", "nonce" "bytea", "key" "bytea"); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_aead_ietf_decrypt"("message" "bytea", "additional" "bytea", "nonce" "bytea", "key" "bytea") FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_aead_ietf_decrypt"("message" "bytea", "additional" "bytea", "nonce" "bytea", "key" "bytea") FROM "pgsodium_keyholder";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_aead_ietf_decrypt"("message" "bytea", "additional" "bytea", "nonce" "bytea", "key" "bytea") TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_aead_ietf_decrypt"("message" "bytea", "additional" "bytea", "nonce" "bytea", "key" "bytea") TO "pgsodium_keyholder";


--
-- Name: FUNCTION "crypto_aead_ietf_decrypt"("message" "bytea", "additional" "bytea", "nonce" "bytea", "key_id" bigint, "context" "bytea"); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_aead_ietf_decrypt"("message" "bytea", "additional" "bytea", "nonce" "bytea", "key_id" bigint, "context" "bytea") FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_aead_ietf_decrypt"("message" "bytea", "additional" "bytea", "nonce" "bytea", "key_id" bigint, "context" "bytea") FROM "pgsodium_keyiduser";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_aead_ietf_decrypt"("message" "bytea", "additional" "bytea", "nonce" "bytea", "key_id" bigint, "context" "bytea") TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_aead_ietf_decrypt"("message" "bytea", "additional" "bytea", "nonce" "bytea", "key_id" bigint, "context" "bytea") TO "pgsodium_keyiduser";


--
-- Name: FUNCTION "crypto_aead_ietf_encrypt"("message" "bytea", "additional" "bytea", "nonce" "bytea", "key" "bytea"); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_aead_ietf_encrypt"("message" "bytea", "additional" "bytea", "nonce" "bytea", "key" "bytea") FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_aead_ietf_encrypt"("message" "bytea", "additional" "bytea", "nonce" "bytea", "key" "bytea") FROM "pgsodium_keyholder";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_aead_ietf_encrypt"("message" "bytea", "additional" "bytea", "nonce" "bytea", "key" "bytea") TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_aead_ietf_encrypt"("message" "bytea", "additional" "bytea", "nonce" "bytea", "key" "bytea") TO "pgsodium_keyholder";


--
-- Name: FUNCTION "crypto_aead_ietf_encrypt"("message" "bytea", "additional" "bytea", "nonce" "bytea", "key_id" bigint, "context" "bytea"); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_aead_ietf_encrypt"("message" "bytea", "additional" "bytea", "nonce" "bytea", "key_id" bigint, "context" "bytea") FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_aead_ietf_encrypt"("message" "bytea", "additional" "bytea", "nonce" "bytea", "key_id" bigint, "context" "bytea") FROM "pgsodium_keyiduser";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_aead_ietf_encrypt"("message" "bytea", "additional" "bytea", "nonce" "bytea", "key_id" bigint, "context" "bytea") TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_aead_ietf_encrypt"("message" "bytea", "additional" "bytea", "nonce" "bytea", "key_id" bigint, "context" "bytea") TO "pgsodium_keyiduser";


--
-- Name: FUNCTION "crypto_aead_ietf_keygen"(); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_aead_ietf_keygen"() FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_aead_ietf_keygen"() FROM "pgsodium_keymaker";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_aead_ietf_keygen"() TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_aead_ietf_keygen"() TO "pgsodium_keymaker";


--
-- Name: FUNCTION "crypto_aead_ietf_noncegen"(); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_aead_ietf_noncegen"() FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_aead_ietf_noncegen"() FROM "pgsodium_keyiduser";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_aead_ietf_noncegen"() TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_aead_ietf_noncegen"() TO "pgsodium_keyiduser";


--
-- Name: FUNCTION "crypto_auth"("message" "bytea", "key" "bytea"); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_auth"("message" "bytea", "key" "bytea") FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_auth"("message" "bytea", "key" "bytea") FROM "pgsodium_keyholder";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_auth"("message" "bytea", "key" "bytea") TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_auth"("message" "bytea", "key" "bytea") TO "pgsodium_keyholder";


--
-- Name: FUNCTION "crypto_auth"("message" "bytea", "key_id" bigint, "context" "bytea"); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_auth"("message" "bytea", "key_id" bigint, "context" "bytea") FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_auth"("message" "bytea", "key_id" bigint, "context" "bytea") FROM "pgsodium_keyiduser";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_auth"("message" "bytea", "key_id" bigint, "context" "bytea") TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_auth"("message" "bytea", "key_id" bigint, "context" "bytea") TO "pgsodium_keyiduser";


--
-- Name: FUNCTION "crypto_auth_hmacsha256"("message" "bytea", "secret" "bytea"); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_auth_hmacsha256"("message" "bytea", "secret" "bytea") FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_auth_hmacsha256"("message" "bytea", "secret" "bytea") FROM "pgsodium_keyholder";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_auth_hmacsha256"("message" "bytea", "secret" "bytea") TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_auth_hmacsha256"("message" "bytea", "secret" "bytea") TO "pgsodium_keyholder";


--
-- Name: FUNCTION "crypto_auth_hmacsha256"("message" "bytea", "key_id" bigint, "context" "bytea"); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_auth_hmacsha256"("message" "bytea", "key_id" bigint, "context" "bytea") FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_auth_hmacsha256"("message" "bytea", "key_id" bigint, "context" "bytea") FROM "pgsodium_keyiduser";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_auth_hmacsha256"("message" "bytea", "key_id" bigint, "context" "bytea") TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_auth_hmacsha256"("message" "bytea", "key_id" bigint, "context" "bytea") TO "pgsodium_keyiduser";


--
-- Name: FUNCTION "crypto_auth_hmacsha256_keygen"(); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_auth_hmacsha256_keygen"() FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_auth_hmacsha256_keygen"() FROM "pgsodium_keymaker";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_auth_hmacsha256_keygen"() TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_auth_hmacsha256_keygen"() TO "pgsodium_keymaker";


--
-- Name: FUNCTION "crypto_auth_hmacsha256_verify"("hash" "bytea", "message" "bytea", "secret" "bytea"); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_auth_hmacsha256_verify"("hash" "bytea", "message" "bytea", "secret" "bytea") FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_auth_hmacsha256_verify"("hash" "bytea", "message" "bytea", "secret" "bytea") FROM "pgsodium_keyholder";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_auth_hmacsha256_verify"("hash" "bytea", "message" "bytea", "secret" "bytea") TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_auth_hmacsha256_verify"("hash" "bytea", "message" "bytea", "secret" "bytea") TO "pgsodium_keyholder";


--
-- Name: FUNCTION "crypto_auth_hmacsha256_verify"("hash" "bytea", "message" "bytea", "key_id" bigint, "context" "bytea"); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_auth_hmacsha256_verify"("hash" "bytea", "message" "bytea", "key_id" bigint, "context" "bytea") FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_auth_hmacsha256_verify"("hash" "bytea", "message" "bytea", "key_id" bigint, "context" "bytea") FROM "pgsodium_keyiduser";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_auth_hmacsha256_verify"("hash" "bytea", "message" "bytea", "key_id" bigint, "context" "bytea") TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_auth_hmacsha256_verify"("hash" "bytea", "message" "bytea", "key_id" bigint, "context" "bytea") TO "pgsodium_keyiduser";


--
-- Name: FUNCTION "crypto_auth_hmacsha512"("message" "bytea", "secret" "bytea"); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_auth_hmacsha512"("message" "bytea", "secret" "bytea") FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_auth_hmacsha512"("message" "bytea", "secret" "bytea") FROM "pgsodium_keyholder";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_auth_hmacsha512"("message" "bytea", "secret" "bytea") TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_auth_hmacsha512"("message" "bytea", "secret" "bytea") TO "pgsodium_keyholder";


--
-- Name: FUNCTION "crypto_auth_hmacsha512"("message" "bytea", "key_id" bigint, "context" "bytea"); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_auth_hmacsha512"("message" "bytea", "key_id" bigint, "context" "bytea") FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_auth_hmacsha512"("message" "bytea", "key_id" bigint, "context" "bytea") FROM "pgsodium_keyiduser";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_auth_hmacsha512"("message" "bytea", "key_id" bigint, "context" "bytea") TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_auth_hmacsha512"("message" "bytea", "key_id" bigint, "context" "bytea") TO "pgsodium_keyiduser";


--
-- Name: FUNCTION "crypto_auth_hmacsha512_verify"("hash" "bytea", "message" "bytea", "secret" "bytea"); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_auth_hmacsha512_verify"("hash" "bytea", "message" "bytea", "secret" "bytea") FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_auth_hmacsha512_verify"("hash" "bytea", "message" "bytea", "secret" "bytea") FROM "pgsodium_keyholder";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_auth_hmacsha512_verify"("hash" "bytea", "message" "bytea", "secret" "bytea") TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_auth_hmacsha512_verify"("hash" "bytea", "message" "bytea", "secret" "bytea") TO "pgsodium_keyholder";


--
-- Name: FUNCTION "crypto_auth_hmacsha512_verify"("hash" "bytea", "message" "bytea", "key_id" bigint, "context" "bytea"); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_auth_hmacsha512_verify"("hash" "bytea", "message" "bytea", "key_id" bigint, "context" "bytea") FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_auth_hmacsha512_verify"("hash" "bytea", "message" "bytea", "key_id" bigint, "context" "bytea") FROM "pgsodium_keyiduser";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_auth_hmacsha512_verify"("hash" "bytea", "message" "bytea", "key_id" bigint, "context" "bytea") TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_auth_hmacsha512_verify"("hash" "bytea", "message" "bytea", "key_id" bigint, "context" "bytea") TO "pgsodium_keyiduser";


--
-- Name: FUNCTION "crypto_auth_keygen"(); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_auth_keygen"() FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_auth_keygen"() FROM "pgsodium_keymaker";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_auth_keygen"() TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_auth_keygen"() TO "pgsodium_keymaker";


--
-- Name: FUNCTION "crypto_auth_verify"("mac" "bytea", "message" "bytea", "key" "bytea"); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_auth_verify"("mac" "bytea", "message" "bytea", "key" "bytea") FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_auth_verify"("mac" "bytea", "message" "bytea", "key" "bytea") FROM "pgsodium_keyholder";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_auth_verify"("mac" "bytea", "message" "bytea", "key" "bytea") TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_auth_verify"("mac" "bytea", "message" "bytea", "key" "bytea") TO "pgsodium_keyholder";


--
-- Name: FUNCTION "crypto_auth_verify"("mac" "bytea", "message" "bytea", "key_id" bigint, "context" "bytea"); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_auth_verify"("mac" "bytea", "message" "bytea", "key_id" bigint, "context" "bytea") FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_auth_verify"("mac" "bytea", "message" "bytea", "key_id" bigint, "context" "bytea") FROM "pgsodium_keyiduser";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_auth_verify"("mac" "bytea", "message" "bytea", "key_id" bigint, "context" "bytea") TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_auth_verify"("mac" "bytea", "message" "bytea", "key_id" bigint, "context" "bytea") TO "pgsodium_keyiduser";


--
-- Name: FUNCTION "crypto_box"("message" "bytea", "nonce" "bytea", "public" "bytea", "secret" "bytea"); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_box"("message" "bytea", "nonce" "bytea", "public" "bytea", "secret" "bytea") FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_box"("message" "bytea", "nonce" "bytea", "public" "bytea", "secret" "bytea") FROM "pgsodium_keyholder";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_box"("message" "bytea", "nonce" "bytea", "public" "bytea", "secret" "bytea") TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_box"("message" "bytea", "nonce" "bytea", "public" "bytea", "secret" "bytea") TO "pgsodium_keyholder";


--
-- Name: FUNCTION "crypto_box_new_keypair"(); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_box_new_keypair"() FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_box_new_keypair"() FROM "pgsodium_keymaker";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_box_new_keypair"() TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_box_new_keypair"() TO "pgsodium_keymaker";


--
-- Name: FUNCTION "crypto_box_noncegen"(); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_box_noncegen"() FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_box_noncegen"() FROM "pgsodium_keymaker";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_box_noncegen"() TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_box_noncegen"() TO "pgsodium_keymaker";


--
-- Name: FUNCTION "crypto_box_open"("ciphertext" "bytea", "nonce" "bytea", "public" "bytea", "secret" "bytea"); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_box_open"("ciphertext" "bytea", "nonce" "bytea", "public" "bytea", "secret" "bytea") FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_box_open"("ciphertext" "bytea", "nonce" "bytea", "public" "bytea", "secret" "bytea") FROM "pgsodium_keyholder";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_box_open"("ciphertext" "bytea", "nonce" "bytea", "public" "bytea", "secret" "bytea") TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_box_open"("ciphertext" "bytea", "nonce" "bytea", "public" "bytea", "secret" "bytea") TO "pgsodium_keyholder";


--
-- Name: FUNCTION "crypto_box_seed_new_keypair"("seed" "bytea"); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_box_seed_new_keypair"("seed" "bytea") FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_box_seed_new_keypair"("seed" "bytea") FROM "pgsodium_keymaker";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_box_seed_new_keypair"("seed" "bytea") TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_box_seed_new_keypair"("seed" "bytea") TO "pgsodium_keymaker";


--
-- Name: FUNCTION "crypto_generichash"("message" "bytea", "key" "bytea"); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_generichash"("message" "bytea", "key" "bytea") FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_generichash"("message" "bytea", "key" "bytea") FROM "pgsodium_keyiduser";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_generichash"("message" "bytea", "key" "bytea") TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_generichash"("message" "bytea", "key" "bytea") TO "pgsodium_keyiduser";


--
-- Name: FUNCTION "crypto_generichash_keygen"(); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_generichash_keygen"() FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_generichash_keygen"() FROM "pgsodium_keymaker";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_generichash_keygen"() TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_generichash_keygen"() TO "pgsodium_keymaker";


--
-- Name: FUNCTION "crypto_kdf_derive_from_key"("subkey_size" bigint, "subkey_id" bigint, "context" "bytea", "primary_key" "bytea"); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_kdf_derive_from_key"("subkey_size" bigint, "subkey_id" bigint, "context" "bytea", "primary_key" "bytea") FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_kdf_derive_from_key"("subkey_size" bigint, "subkey_id" bigint, "context" "bytea", "primary_key" "bytea") FROM "pgsodium_keymaker";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_kdf_derive_from_key"("subkey_size" bigint, "subkey_id" bigint, "context" "bytea", "primary_key" "bytea") TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_kdf_derive_from_key"("subkey_size" bigint, "subkey_id" bigint, "context" "bytea", "primary_key" "bytea") TO "pgsodium_keymaker";


--
-- Name: FUNCTION "crypto_kdf_keygen"(); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_kdf_keygen"() FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_kdf_keygen"() FROM "pgsodium_keymaker";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_kdf_keygen"() TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_kdf_keygen"() TO "pgsodium_keymaker";


--
-- Name: FUNCTION "crypto_kx_new_keypair"(); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_kx_new_keypair"() FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_kx_new_keypair"() FROM "pgsodium_keymaker";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_kx_new_keypair"() TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_kx_new_keypair"() TO "pgsodium_keymaker";


--
-- Name: FUNCTION "crypto_kx_new_seed"(); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_kx_new_seed"() FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_kx_new_seed"() FROM "pgsodium_keymaker";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_kx_new_seed"() TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_kx_new_seed"() TO "pgsodium_keymaker";


--
-- Name: FUNCTION "crypto_kx_seed_new_keypair"("seed" "bytea"); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_kx_seed_new_keypair"("seed" "bytea") FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_kx_seed_new_keypair"("seed" "bytea") FROM "pgsodium_keymaker";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_kx_seed_new_keypair"("seed" "bytea") TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_kx_seed_new_keypair"("seed" "bytea") TO "pgsodium_keymaker";


--
-- Name: FUNCTION "crypto_secretbox"("message" "bytea", "nonce" "bytea", "key" "bytea"); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_secretbox"("message" "bytea", "nonce" "bytea", "key" "bytea") FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_secretbox"("message" "bytea", "nonce" "bytea", "key" "bytea") FROM "pgsodium_keyholder";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_secretbox"("message" "bytea", "nonce" "bytea", "key" "bytea") TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_secretbox"("message" "bytea", "nonce" "bytea", "key" "bytea") TO "pgsodium_keyholder";


--
-- Name: FUNCTION "crypto_secretbox"("message" "bytea", "nonce" "bytea", "key_id" bigint, "context" "bytea"); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_secretbox"("message" "bytea", "nonce" "bytea", "key_id" bigint, "context" "bytea") FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_secretbox"("message" "bytea", "nonce" "bytea", "key_id" bigint, "context" "bytea") FROM "pgsodium_keyiduser";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_secretbox"("message" "bytea", "nonce" "bytea", "key_id" bigint, "context" "bytea") TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_secretbox"("message" "bytea", "nonce" "bytea", "key_id" bigint, "context" "bytea") TO "pgsodium_keyiduser";


--
-- Name: FUNCTION "crypto_secretbox_keygen"(); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_secretbox_keygen"() FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_secretbox_keygen"() FROM "pgsodium_keymaker";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_secretbox_keygen"() TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_secretbox_keygen"() TO "pgsodium_keymaker";


--
-- Name: FUNCTION "crypto_secretbox_noncegen"(); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_secretbox_noncegen"() FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_secretbox_noncegen"() FROM "pgsodium_keyiduser";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_secretbox_noncegen"() TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_secretbox_noncegen"() TO "pgsodium_keyiduser";


--
-- Name: FUNCTION "crypto_secretbox_open"("ciphertext" "bytea", "nonce" "bytea", "key" "bytea"); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_secretbox_open"("ciphertext" "bytea", "nonce" "bytea", "key" "bytea") FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_secretbox_open"("ciphertext" "bytea", "nonce" "bytea", "key" "bytea") FROM "pgsodium_keyholder";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_secretbox_open"("ciphertext" "bytea", "nonce" "bytea", "key" "bytea") TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_secretbox_open"("ciphertext" "bytea", "nonce" "bytea", "key" "bytea") TO "pgsodium_keyholder";


--
-- Name: FUNCTION "crypto_secretbox_open"("message" "bytea", "nonce" "bytea", "key_id" bigint, "context" "bytea"); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_secretbox_open"("message" "bytea", "nonce" "bytea", "key_id" bigint, "context" "bytea") FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_secretbox_open"("message" "bytea", "nonce" "bytea", "key_id" bigint, "context" "bytea") FROM "pgsodium_keyiduser";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_secretbox_open"("message" "bytea", "nonce" "bytea", "key_id" bigint, "context" "bytea") TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_secretbox_open"("message" "bytea", "nonce" "bytea", "key_id" bigint, "context" "bytea") TO "pgsodium_keyiduser";


--
-- Name: FUNCTION "crypto_shorthash"("message" "bytea", "key" "bytea"); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_shorthash"("message" "bytea", "key" "bytea") FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_shorthash"("message" "bytea", "key" "bytea") FROM "pgsodium_keyiduser";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_shorthash"("message" "bytea", "key" "bytea") TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_shorthash"("message" "bytea", "key" "bytea") TO "pgsodium_keyiduser";


--
-- Name: FUNCTION "crypto_shorthash_keygen"(); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_shorthash_keygen"() FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_shorthash_keygen"() FROM "pgsodium_keymaker";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_shorthash_keygen"() TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_shorthash_keygen"() TO "pgsodium_keymaker";


--
-- Name: FUNCTION "crypto_sign_final_create"("state" "bytea", "key" "bytea"); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_sign_final_create"("state" "bytea", "key" "bytea") FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_sign_final_create"("state" "bytea", "key" "bytea") FROM "pgsodium_keyholder";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_sign_final_create"("state" "bytea", "key" "bytea") TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_sign_final_create"("state" "bytea", "key" "bytea") TO "pgsodium_keyholder";


--
-- Name: FUNCTION "crypto_sign_final_verify"("state" "bytea", "signature" "bytea", "key" "bytea"); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_sign_final_verify"("state" "bytea", "signature" "bytea", "key" "bytea") FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_sign_final_verify"("state" "bytea", "signature" "bytea", "key" "bytea") FROM "pgsodium_keyholder";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_sign_final_verify"("state" "bytea", "signature" "bytea", "key" "bytea") TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_sign_final_verify"("state" "bytea", "signature" "bytea", "key" "bytea") TO "pgsodium_keyholder";


--
-- Name: FUNCTION "crypto_sign_init"(); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_sign_init"() FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_sign_init"() FROM "pgsodium_keyholder";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_sign_init"() TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_sign_init"() TO "pgsodium_keyholder";


--
-- Name: FUNCTION "crypto_sign_new_keypair"(); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_sign_new_keypair"() FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_sign_new_keypair"() FROM "pgsodium_keymaker";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_sign_new_keypair"() TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_sign_new_keypair"() TO "pgsodium_keymaker";


--
-- Name: FUNCTION "crypto_sign_update"("state" "bytea", "message" "bytea"); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_sign_update"("state" "bytea", "message" "bytea") FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_sign_update"("state" "bytea", "message" "bytea") FROM "pgsodium_keyholder";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_sign_update"("state" "bytea", "message" "bytea") TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_sign_update"("state" "bytea", "message" "bytea") TO "pgsodium_keyholder";


--
-- Name: FUNCTION "crypto_sign_update_agg1"("state" "bytea", "message" "bytea"); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_sign_update_agg1"("state" "bytea", "message" "bytea") FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_sign_update_agg1"("state" "bytea", "message" "bytea") FROM "pgsodium_keyholder";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_sign_update_agg1"("state" "bytea", "message" "bytea") TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_sign_update_agg1"("state" "bytea", "message" "bytea") TO "pgsodium_keyholder";


--
-- Name: FUNCTION "crypto_sign_update_agg2"("cur_state" "bytea", "initial_state" "bytea", "message" "bytea"); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_sign_update_agg2"("cur_state" "bytea", "initial_state" "bytea", "message" "bytea") FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_sign_update_agg2"("cur_state" "bytea", "initial_state" "bytea", "message" "bytea") FROM "pgsodium_keyholder";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_sign_update_agg2"("cur_state" "bytea", "initial_state" "bytea", "message" "bytea") TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_sign_update_agg2"("cur_state" "bytea", "initial_state" "bytea", "message" "bytea") TO "pgsodium_keyholder";


--
-- Name: FUNCTION "crypto_signcrypt_new_keypair"(); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_signcrypt_new_keypair"() FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_signcrypt_new_keypair"() FROM "pgsodium_keymaker";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_signcrypt_new_keypair"() TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_signcrypt_new_keypair"() TO "pgsodium_keymaker";


--
-- Name: FUNCTION "crypto_signcrypt_sign_after"("state" "bytea", "sender_sk" "bytea", "ciphertext" "bytea"); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_signcrypt_sign_after"("state" "bytea", "sender_sk" "bytea", "ciphertext" "bytea") FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_signcrypt_sign_after"("state" "bytea", "sender_sk" "bytea", "ciphertext" "bytea") FROM "pgsodium_keyholder";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_signcrypt_sign_after"("state" "bytea", "sender_sk" "bytea", "ciphertext" "bytea") TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_signcrypt_sign_after"("state" "bytea", "sender_sk" "bytea", "ciphertext" "bytea") TO "pgsodium_keyholder";


--
-- Name: FUNCTION "crypto_signcrypt_sign_before"("sender" "bytea", "recipient" "bytea", "sender_sk" "bytea", "recipient_pk" "bytea", "additional" "bytea"); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_signcrypt_sign_before"("sender" "bytea", "recipient" "bytea", "sender_sk" "bytea", "recipient_pk" "bytea", "additional" "bytea") FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_signcrypt_sign_before"("sender" "bytea", "recipient" "bytea", "sender_sk" "bytea", "recipient_pk" "bytea", "additional" "bytea") FROM "pgsodium_keyholder";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_signcrypt_sign_before"("sender" "bytea", "recipient" "bytea", "sender_sk" "bytea", "recipient_pk" "bytea", "additional" "bytea") TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_signcrypt_sign_before"("sender" "bytea", "recipient" "bytea", "sender_sk" "bytea", "recipient_pk" "bytea", "additional" "bytea") TO "pgsodium_keyholder";


--
-- Name: FUNCTION "crypto_signcrypt_verify_after"("state" "bytea", "signature" "bytea", "sender_pk" "bytea", "ciphertext" "bytea"); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_signcrypt_verify_after"("state" "bytea", "signature" "bytea", "sender_pk" "bytea", "ciphertext" "bytea") FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_signcrypt_verify_after"("state" "bytea", "signature" "bytea", "sender_pk" "bytea", "ciphertext" "bytea") FROM "pgsodium_keyholder";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_signcrypt_verify_after"("state" "bytea", "signature" "bytea", "sender_pk" "bytea", "ciphertext" "bytea") TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_signcrypt_verify_after"("state" "bytea", "signature" "bytea", "sender_pk" "bytea", "ciphertext" "bytea") TO "pgsodium_keyholder";


--
-- Name: FUNCTION "crypto_signcrypt_verify_before"("signature" "bytea", "sender" "bytea", "recipient" "bytea", "additional" "bytea", "sender_pk" "bytea", "recipient_sk" "bytea"); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_signcrypt_verify_before"("signature" "bytea", "sender" "bytea", "recipient" "bytea", "additional" "bytea", "sender_pk" "bytea", "recipient_sk" "bytea") FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_signcrypt_verify_before"("signature" "bytea", "sender" "bytea", "recipient" "bytea", "additional" "bytea", "sender_pk" "bytea", "recipient_sk" "bytea") FROM "pgsodium_keyholder";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_signcrypt_verify_before"("signature" "bytea", "sender" "bytea", "recipient" "bytea", "additional" "bytea", "sender_pk" "bytea", "recipient_sk" "bytea") TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_signcrypt_verify_before"("signature" "bytea", "sender" "bytea", "recipient" "bytea", "additional" "bytea", "sender_pk" "bytea", "recipient_sk" "bytea") TO "pgsodium_keyholder";


--
-- Name: FUNCTION "crypto_signcrypt_verify_public"("signature" "bytea", "sender" "bytea", "recipient" "bytea", "additional" "bytea", "sender_pk" "bytea", "ciphertext" "bytea"); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_signcrypt_verify_public"("signature" "bytea", "sender" "bytea", "recipient" "bytea", "additional" "bytea", "sender_pk" "bytea", "ciphertext" "bytea") FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."crypto_signcrypt_verify_public"("signature" "bytea", "sender" "bytea", "recipient" "bytea", "additional" "bytea", "sender_pk" "bytea", "ciphertext" "bytea") FROM "pgsodium_keyholder";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_signcrypt_verify_public"("signature" "bytea", "sender" "bytea", "recipient" "bytea", "additional" "bytea", "sender_pk" "bytea", "ciphertext" "bytea") TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."crypto_signcrypt_verify_public"("signature" "bytea", "sender" "bytea", "recipient" "bytea", "additional" "bytea", "sender_pk" "bytea", "ciphertext" "bytea") TO "pgsodium_keyholder";


--
-- Name: FUNCTION "derive_key"("key_id" bigint, "key_len" integer, "context" "bytea"); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."derive_key"("key_id" bigint, "key_len" integer, "context" "bytea") FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."derive_key"("key_id" bigint, "key_len" integer, "context" "bytea") FROM "pgsodium_keymaker";
-- GRANT ALL ON FUNCTION "pgsodium"."derive_key"("key_id" bigint, "key_len" integer, "context" "bytea") TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."derive_key"("key_id" bigint, "key_len" integer, "context" "bytea") TO "pgsodium_keymaker";


--
-- Name: FUNCTION "pgsodium_derive"("key_id" bigint, "key_len" integer, "context" "bytea"); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."pgsodium_derive"("key_id" bigint, "key_len" integer, "context" "bytea") FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."pgsodium_derive"("key_id" bigint, "key_len" integer, "context" "bytea") FROM "pgsodium_keymaker";
-- GRANT ALL ON FUNCTION "pgsodium"."pgsodium_derive"("key_id" bigint, "key_len" integer, "context" "bytea") TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."pgsodium_derive"("key_id" bigint, "key_len" integer, "context" "bytea") TO "pgsodium_keymaker";


--
-- Name: FUNCTION "randombytes_buf"("size" integer); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."randombytes_buf"("size" integer) FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."randombytes_buf"("size" integer) FROM "pgsodium_keyiduser";
-- GRANT ALL ON FUNCTION "pgsodium"."randombytes_buf"("size" integer) TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."randombytes_buf"("size" integer) TO "pgsodium_keyiduser";


--
-- Name: FUNCTION "randombytes_buf_deterministic"("size" integer, "seed" "bytea"); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."randombytes_buf_deterministic"("size" integer, "seed" "bytea") FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."randombytes_buf_deterministic"("size" integer, "seed" "bytea") FROM "pgsodium_keymaker";
-- REVOKE ALL ON FUNCTION "pgsodium"."randombytes_buf_deterministic"("size" integer, "seed" "bytea") FROM "pgsodium_keyiduser";
-- GRANT ALL ON FUNCTION "pgsodium"."randombytes_buf_deterministic"("size" integer, "seed" "bytea") TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."randombytes_buf_deterministic"("size" integer, "seed" "bytea") TO "pgsodium_keymaker";
-- GRANT ALL ON FUNCTION "pgsodium"."randombytes_buf_deterministic"("size" integer, "seed" "bytea") TO "pgsodium_keyiduser";


--
-- Name: FUNCTION "randombytes_new_seed"(); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."randombytes_new_seed"() FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."randombytes_new_seed"() FROM "pgsodium_keymaker";
-- GRANT ALL ON FUNCTION "pgsodium"."randombytes_new_seed"() TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."randombytes_new_seed"() TO "pgsodium_keymaker";


--
-- Name: FUNCTION "randombytes_random"(); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."randombytes_random"() FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."randombytes_random"() FROM "pgsodium_keyiduser";
-- GRANT ALL ON FUNCTION "pgsodium"."randombytes_random"() TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."randombytes_random"() TO "pgsodium_keyiduser";


--
-- Name: FUNCTION "randombytes_uniform"("upper_bound" integer); Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "pgsodium"."randombytes_uniform"("upper_bound" integer) FROM "supabase_admin";
-- REVOKE ALL ON FUNCTION "pgsodium"."randombytes_uniform"("upper_bound" integer) FROM "pgsodium_keyiduser";
-- GRANT ALL ON FUNCTION "pgsodium"."randombytes_uniform"("upper_bound" integer) TO "postgres";
-- GRANT ALL ON FUNCTION "pgsodium"."randombytes_uniform"("upper_bound" integer) TO "pgsodium_keyiduser";


--
-- Name: FUNCTION "add_everyone_role_to_new_joins"(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."add_everyone_role_to_new_joins"() TO "anon";
GRANT ALL ON FUNCTION "public"."add_everyone_role_to_new_joins"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."add_everyone_role_to_new_joins"() TO "service_role";


--
-- Name: FUNCTION "create_base_channel_permissions_on_channel_create"(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."create_base_channel_permissions_on_channel_create"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_base_channel_permissions_on_channel_create"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_base_channel_permissions_on_channel_create"() TO "service_role";


--
-- Name: TABLE "messages"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."messages" TO "anon";
GRANT ALL ON TABLE "public"."messages" TO "authenticated";
GRANT ALL ON TABLE "public"."messages" TO "service_role";


--
-- Name: FUNCTION "createmessage"("c_id" bigint, "p_id" "uuid", "content" "text"); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."createmessage"("c_id" bigint, "p_id" "uuid", "content" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."createmessage"("c_id" bigint, "p_id" "uuid", "content" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."createmessage"("c_id" bigint, "p_id" "uuid", "content" "text") TO "service_role";


--
-- Name: FUNCTION "flag_message_edits"(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."flag_message_edits"() TO "anon";
GRANT ALL ON FUNCTION "public"."flag_message_edits"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."flag_message_edits"() TO "service_role";


--
-- Name: FUNCTION "get_all_channels_for_user"("p_id" "uuid"); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."get_all_channels_for_user"("p_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_all_channels_for_user"("p_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_all_channels_for_user"("p_id" "uuid") TO "service_role";


--
-- Name: FUNCTION "get_channel_permission_flags"("c_id" bigint); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."get_channel_permission_flags"("c_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."get_channel_permission_flags"("c_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_channel_permission_flags"("c_id" bigint) TO "service_role";


--
-- Name: FUNCTION "get_highest_role_position_for_user"("p_id" "uuid", "s_id" bigint); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."get_highest_role_position_for_user"("p_id" "uuid", "s_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."get_highest_role_position_for_user"("p_id" "uuid", "s_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_highest_role_position_for_user"("p_id" "uuid", "s_id" bigint) TO "service_role";


--
-- Name: FUNCTION "get_owner_id_of_server_from_message"("m_id" bigint); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."get_owner_id_of_server_from_message"("m_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."get_owner_id_of_server_from_message"("m_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_owner_id_of_server_from_message"("m_id" bigint) TO "service_role";


--
-- Name: FUNCTION "get_permission_flags_for_server_user"("s_id" bigint, "p_id" "uuid"); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."get_permission_flags_for_server_user"("s_id" bigint, "p_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_permission_flags_for_server_user"("s_id" bigint, "p_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_permission_flags_for_server_user"("s_id" bigint, "p_id" "uuid") TO "service_role";


--
-- Name: FUNCTION "get_roles_for_user_in_server"("p_id" "uuid", "s_id" bigint); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."get_roles_for_user_in_server"("p_id" "uuid", "s_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."get_roles_for_user_in_server"("p_id" "uuid", "s_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_roles_for_user_in_server"("p_id" "uuid", "s_id" bigint) TO "service_role";


--
-- Name: FUNCTION "get_server_id_of_message"("m_id" bigint); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."get_server_id_of_message"("m_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."get_server_id_of_message"("m_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_server_id_of_message"("m_id" bigint) TO "service_role";


--
-- Name: TABLE "servers"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."servers" TO "anon";
GRANT ALL ON TABLE "public"."servers" TO "authenticated";
GRANT ALL ON TABLE "public"."servers" TO "service_role";


--
-- Name: FUNCTION "get_servers_for_user"(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."get_servers_for_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_servers_for_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_servers_for_user"() TO "service_role";


--
-- Name: TABLE "profiles"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";


--
-- Name: FUNCTION "get_users_in_server"("s_id" bigint); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."get_users_in_server"("s_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."get_users_in_server"("s_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_users_in_server"("s_id" bigint) TO "service_role";


--
-- Name: FUNCTION "handle_new_user"(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";


--
-- Name: FUNCTION "is_user_in_server"("p_id" "uuid", "s_id" bigint); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."is_user_in_server"("p_id" "uuid", "s_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."is_user_in_server"("p_id" "uuid", "s_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_user_in_server"("p_id" "uuid", "s_id" bigint) TO "service_role";


--
-- Name: FUNCTION "remove_user_from_server_on_ban"(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."remove_user_from_server_on_ban"() TO "anon";
GRANT ALL ON FUNCTION "public"."remove_user_from_server_on_ban"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."remove_user_from_server_on_ban"() TO "service_role";


--
-- Name: FUNCTION "server_create_hook"(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."server_create_hook"() TO "anon";
GRANT ALL ON FUNCTION "public"."server_create_hook"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."server_create_hook"() TO "service_role";


--
-- Name: TABLE "pg_stat_statements"; Type: ACL; Schema: extensions; Owner: postgres
--

-- GRANT ALL ON TABLE "extensions"."pg_stat_statements" TO "dashboard_user";


--
-- Name: TABLE "pg_stat_statements_info"; Type: ACL; Schema: extensions; Owner: postgres
--

-- GRANT ALL ON TABLE "extensions"."pg_stat_statements_info" TO "dashboard_user";


--
-- Name: SEQUENCE "seq_schema_version"; Type: ACL; Schema: graphql; Owner: supabase_admin
--

-- GRANT ALL ON SEQUENCE "graphql"."seq_schema_version" TO "postgres";
-- GRANT ALL ON SEQUENCE "graphql"."seq_schema_version" TO "anon";
-- GRANT ALL ON SEQUENCE "graphql"."seq_schema_version" TO "authenticated";
-- GRANT ALL ON SEQUENCE "graphql"."seq_schema_version" TO "service_role";


--
-- Name: TABLE "_http_response"; Type: ACL; Schema: net; Owner: postgres
--

-- REVOKE ALL ON TABLE "net"."_http_response" FROM "supabase_admin";
-- REVOKE ALL ON TABLE "net"."_http_response" FROM "postgres";
-- GRANT ALL ON TABLE "net"."_http_response" TO "postgres";


--
-- Name: TABLE "http_request_queue"; Type: ACL; Schema: net; Owner: postgres
--

-- REVOKE ALL ON TABLE "net"."http_request_queue" FROM "supabase_admin";
-- REVOKE ALL ON TABLE "net"."http_request_queue" FROM "postgres";
-- GRANT ALL ON TABLE "net"."http_request_queue" TO "postgres";


--
-- Name: TABLE "decrypted_key"; Type: ACL; Schema: pgsodium; Owner: postgres
--

-- GRANT ALL ON TABLE "pgsodium"."decrypted_key" TO "pgsodium_keyholder";


--
-- Name: SEQUENCE "key_key_id_seq"; Type: ACL; Schema: pgsodium; Owner: postgres
--

-- REVOKE ALL ON SEQUENCE "pgsodium"."key_key_id_seq" FROM "supabase_admin";
-- REVOKE ALL ON SEQUENCE "pgsodium"."key_key_id_seq" FROM "pgsodium_keymaker";
-- GRANT ALL ON SEQUENCE "pgsodium"."key_key_id_seq" TO "postgres";
-- GRANT ALL ON SEQUENCE "pgsodium"."key_key_id_seq" TO "pgsodium_keymaker";


--
-- Name: TABLE "masking_rule"; Type: ACL; Schema: pgsodium; Owner: postgres
--

-- GRANT ALL ON TABLE "pgsodium"."masking_rule" TO "pgsodium_keyholder";


--
-- Name: TABLE "mask_columns"; Type: ACL; Schema: pgsodium; Owner: postgres
--

-- GRANT ALL ON TABLE "pgsodium"."mask_columns" TO "pgsodium_keyholder";


--
-- Name: TABLE "channel_permissions"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."channel_permissions" TO "anon";
GRANT ALL ON TABLE "public"."channel_permissions" TO "authenticated";
GRANT ALL ON TABLE "public"."channel_permissions" TO "service_role";


--
-- Name: SEQUENCE "channel_permissions_id_seq"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE "public"."channel_permissions_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."channel_permissions_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."channel_permissions_id_seq" TO "service_role";


--
-- Name: TABLE "channels"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."channels" TO "anon";
GRANT ALL ON TABLE "public"."channels" TO "authenticated";
GRANT ALL ON TABLE "public"."channels" TO "service_role";


--
-- Name: SEQUENCE "channels_channel_id_seq"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE "public"."channels_channel_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."channels_channel_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."channels_channel_id_seq" TO "service_role";


--
-- Name: TABLE "direct_message_channels"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."direct_message_channels" TO "anon";
GRANT ALL ON TABLE "public"."direct_message_channels" TO "authenticated";
GRANT ALL ON TABLE "public"."direct_message_channels" TO "service_role";


--
-- Name: SEQUENCE "direct_message_channels_id_seq"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE "public"."direct_message_channels_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."direct_message_channels_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."direct_message_channels_id_seq" TO "service_role";


--
-- Name: TABLE "direct_messages"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."direct_messages" TO "anon";
GRANT ALL ON TABLE "public"."direct_messages" TO "authenticated";
GRANT ALL ON TABLE "public"."direct_messages" TO "service_role";


--
-- Name: SEQUENCE "direct_message_id_seq"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE "public"."direct_message_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."direct_message_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."direct_message_id_seq" TO "service_role";


--
-- Name: TABLE "server_invites"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."server_invites" TO "anon";
GRANT ALL ON TABLE "public"."server_invites" TO "authenticated";
GRANT ALL ON TABLE "public"."server_invites" TO "service_role";


--
-- Name: SEQUENCE "invites_id_seq"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE "public"."invites_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."invites_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."invites_id_seq" TO "service_role";


--
-- Name: SEQUENCE "messages_id_seq"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE "public"."messages_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."messages_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."messages_id_seq" TO "service_role";


--
-- Name: TABLE "server_bans"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."server_bans" TO "anon";
GRANT ALL ON TABLE "public"."server_bans" TO "authenticated";
GRANT ALL ON TABLE "public"."server_bans" TO "service_role";


--
-- Name: SEQUENCE "server_bans_id_seq"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE "public"."server_bans_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."server_bans_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."server_bans_id_seq" TO "service_role";


--
-- Name: TABLE "server_roles"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."server_roles" TO "anon";
GRANT ALL ON TABLE "public"."server_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."server_roles" TO "service_role";


--
-- Name: SEQUENCE "server_roles_id_seq"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE "public"."server_roles_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."server_roles_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."server_roles_id_seq" TO "service_role";


--
-- Name: TABLE "server_user_roles"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."server_user_roles" TO "anon";
GRANT ALL ON TABLE "public"."server_user_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."server_user_roles" TO "service_role";


--
-- Name: SEQUENCE "server_user_roles_id_seq"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE "public"."server_user_roles_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."server_user_roles_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."server_user_roles_id_seq" TO "service_role";


--
-- Name: TABLE "server_users"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."server_users" TO "anon";
GRANT ALL ON TABLE "public"."server_users" TO "authenticated";
GRANT ALL ON TABLE "public"."server_users" TO "service_role";


--
-- Name: SEQUENCE "server_users_id_seq"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE "public"."server_users_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."server_users_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."server_users_id_seq" TO "service_role";


--
-- Name: SEQUENCE "servers_id_seq"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE "public"."servers_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."servers_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."servers_id_seq" TO "service_role";


--
-- Name: TABLE "user_plugins"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."user_plugins" TO "anon";
GRANT ALL ON TABLE "public"."user_plugins" TO "authenticated";
GRANT ALL ON TABLE "public"."user_plugins" TO "service_role";


--
-- Name: SEQUENCE "user_plugins_id_seq"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE "public"."user_plugins_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."user_plugins_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."user_plugins_id_seq" TO "service_role";


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";


--
-- PostgreSQL database dump complete
--

RESET ALL;

