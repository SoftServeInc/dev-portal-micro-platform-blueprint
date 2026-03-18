CREATE DATABASE backstage;
CREATE USER backstage WITH PASSWORD 'backstage' CREATEDB;
GRANT ALL PRIVILEGES ON DATABASE backstage TO backstage;

\connect backstage
ALTER SCHEMA public OWNER TO backstage;
GRANT ALL PRIVILEGES ON SCHEMA public TO backstage;