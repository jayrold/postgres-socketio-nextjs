# 🧠 Realtime PostgreSQL Demo with Socket.IO & Next.js

[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

## About

Inspired by Supabase's realtime feature. I wanted to build a lightweight clone from scratch. This project demonstrates real-time data synchronization between PostgreSQL and a Next.js frontend using Socket.IO, showcasing modern web development practices and real-time application architecture.

## Features

- Listen to DB changes in realtime
- Support for multiple tables
- Table filtering
- Docker-based local development
- Real-time data synchronization
- Scalable architecture
- Easy setup with Docker Compose

## Architecture

The project consists of three main components:

1. **PostgreSQL Database**
   - Uses LISTEN/NOTIFY for real-time events
   - Custom triggers for table changes
   - pgAdmin for database management

2. **Node.js Socket.IO Server**
   - Handles real-time communication
   - Bridges PostgreSQL notifications to WebSocket clients
   - Manages client connections and subscriptions

3. **Next.js Frontend**
   - Real-time data updates
   - Table filtering and data visualization

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

## Development

### Prerequisites
- Docker and Docker Compose
- Node.js (v16 or higher)
- npm or yarn
- PostgreSQL (if running locally)

### Environment Variables
Create a `.env` file in the root directory with the following variables:
```env
POSTGRES_USER=your_user
POSTGRES_PASSWORD=your_password
POSTGRES_DB=your_database
```

## Future Work

- [ ] Add authentication system
- [ ] Implement realtime presence
- [ ] Add more table filtering options
- [ ] Improve error handling and reconnection logic
- [ ] Add unit and integration tests
- [ ] Implement data validation
- [ ] Add rate limiting
- [ ] Support for more database operations
- [ ] Add monitoring and logging
- [ ] Implement caching layer

## Author

Harold Jayson Caminero

## License

MIT License - feel free to use this project for your own purposes.

## Acknowledgments

- Inspired by Supabase's realtime feature
- Built with modern web technologies
- Special thanks to the open-source community 