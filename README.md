# Enable Realtime Notifications on a Table

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