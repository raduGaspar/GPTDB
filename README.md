# GPTDB

A simple in-memory JSON database for Node.js with built-in disk persistence and change watchers.

### Features
- In-memory database for fast access and manipulation
- Persists data to disk in JSON format
- Asynchronous read and write methods
- Change watchers for real-time updates
- Supports nested properties using dot notation
- Provides basic find and get methods

### Installation
```bash
npm install gptdb
```

### Usage

```javascript
(async () => {
  const db = new GPTDB('mydb.json', { value: 'test', something: { name: 'chat', more: { deep: 'value' } }, bookings: [] });
  await db.read();
  console.log(db.get('something.name'));
  db.data.places = [];
  db.data.places.push('Cluj');
  await db.write();

  db.watch('something.name', (oldValue, newValue) => {
    console.log('value changed from', oldValue, 'to', newValue);
  });

  const watcherRef = db.watch('something.more.deep', (oldValue, newValue) => {
    console.log('deep value changed from', oldValue, 'to', newValue);
  });

  db.data.something.name = 'amazing'; // value changed from chat to amazing
  db.data.something.more.deep = 'new deep value'; // deep value changed from value to new deep value
  db.data.something.more.deep = 'yet again';

  watcherRef.remove(); // remove watcher for something.more.deep
  db.data.something.more.deep = 'another one'; // callback not triggered
  await db.write();

  db.data.users = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
    { id: 3, name: 'Alise' },
    { id: 4, name: 'Alice' },
  ];

  db.data.bookings = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
    { id: 3, name: 'Alise' },
    { id: 4, name: 'Alice' },
  ];

  // Find all users with the name 'Alice'
  const results = db.find((value, path) => {
    return value?.name === 'Alice';
  });

  console.log(results.length); // 4 (2 users, 2 bookings)

  // todo: make this trigger with arrays
  db.watch('db.data.bookings', (oldValue, newValue) => {
    console.log('bookings changed from', oldValue, 'to', newValue);
  });

  db.data.bookings = [...db.data.bookings, { id: 5, name: 'Ralph' }]
})();
```

### API
### `GPTDB(filePath[, initialData])`
Creates a new GPTDB instance.

- filePath (string): Path to the JSON file where the data will be persisted.
- initialData (object, optional): Initial data for the database. Defaults to an empty object.

### `async read()`
Reads the data from the JSON file and updates the in-memory data.

### `async write()`
Writes the in-memory data to the JSON file.

### `find(predicate[, obj, path])`
Finds data based on a predicate function.

- predicate (function): Function that returns true for matched data.
- obj (object, optional): Object to search in. Defaults to the in-memory data.
- path (array, optional): Array representing the current path in the data tree. Defaults to an empty array.

### `get(path)`
Gets a specific value from the in-memory data using dot notation.

- path (string): Path to the value in the data.

### `watch(path, callback)`
Watches for changes on a specific path and calls the callback when the value changes.

- path (string): Path to the value in the data.
- callback (function): Function to call when the value changes.

Returns an object with a `remove` method that can be used to stop watching for changes.

### License
MIT License