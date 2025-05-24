# 🧠 Realtime PostgreSQL Demo with Socket.IO & Next.js

[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

## About

Inspired by Supabase's realtime feature. I wanted to build a lightweight clone from scratch.

## Features

- Listen to DB changes in realtime
- Support for multiple tables
- Table filtering
- Docker-based local development

## Quick Start

1. Start the development environment:
```bash
docker-compose up --build
```

2. Run the client application:
```bash
cd realtime-client
npm run dev
```

### Available Services
- pgAdmin: http://localhost:8081
- Node Socket.IO Server: http://localhost:4001
- Realtime Client: http://localhost:3000

## Technical Documentation

### Enable Realtime Notifications on a Table

To enable realtime notifications for a new table, follow these steps in your PostgreSQL database (e.g., via pgAdmin or psql):

## 1. Create the generic trigger function (only once per database)

```sql
CREATE OR REPLACE FUNCTION notify_table_change()
RETURNS trigger AS $$
DECLARE
  payload JSON;
  channel TEXT;
BEGIN
  IF (TG_OP = 'DELETE') THEN
    payload = row_to_json(OLD);
  ELSE
    payload = row_to_json(NEW);
  END IF;

  channel = TG_TABLE_NAME || '_changes';

  PERFORM pg_notify(channel, json_build_object(
    'operation', TG_OP,
    'table', TG_TABLE_NAME,
    'data', payload
  )::text);

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;
```

## 2. Attach triggers to your table (replace your_table_name)

```sql
CREATE TRIGGER your_table_name_insert
AFTER INSERT ON your_table_name
FOR EACH ROW EXECUTE FUNCTION notify_table_change();

CREATE TRIGGER your_table_name_update
AFTER UPDATE ON your_table_name
FOR EACH ROW EXECUTE FUNCTION notify_table_change();

CREATE TRIGGER your_table_name_delete
AFTER DELETE ON your_table_name
FOR EACH ROW EXECUTE FUNCTION notify_table_change();
```

## 3. Listen to notifications in your backend

In your backend, listen to the PostgreSQL channel named:

```
your_table_name_changes
```

## Future Work

- [ ] Add authentication system
- [ ] Implement realtime presence
- [ ] Add more table filtering options
- [ ] Improve error handling and reconnection logic
- [ ] Add unit and integration tests

## Author

Harold Jayson Caminero

## License

MIT License - feel free to use this project for your own purposes. 