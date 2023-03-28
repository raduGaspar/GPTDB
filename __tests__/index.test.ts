import fs from 'fs';
import util from 'util';
import { GPTDB } from '../src';

const unlink = util.promisify(fs.unlink);

const TEST_DB_PATH = 'testdb.json';

afterAll(async () => {
  // Clean up the test JSON file after tests are done
  try {
    await unlink(TEST_DB_PATH);
  } catch (err) {
    // Ignore error if file does not exist
  }
});

describe('GPTDB', () => {
  test('should initialize with the correct data', async () => {
    const db = GPTDB(TEST_DB_PATH, {value: 'test', something: {name: 'chat'}});
    await db.read();
    expect(db.get('value')).toBe('test');
    expect(db.get('something.name')).toBe('chat');
  });

  test('should write data to the JSON file', async () => {
    const db = GPTDB(TEST_DB_PATH, {value: 'test', something: {name: 'chat'}});
    db.data.newValue = 'new data';
    await db.write();

    const newDb = GPTDB(TEST_DB_PATH);
    await newDb.read();
    expect(newDb.get('newValue')).toBe('new data');
  });

  test('should watch for changes', async () => {
    const db = GPTDB(TEST_DB_PATH, {value: 'test', something: {name: 'chat'}});

    const callback = jest.fn();
    const watcher = db.watch('something.name', callback);

    db.data.something.name = 'new name';

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('chat', 'new name');

    watcher.remove();
  });

  test('should find data with a predicate', () => {
    const db = GPTDB(TEST_DB_PATH, {
      items: [
        {id: 1, name: 'item 1'},
        {id: 2, name: 'item 2'},
        {id: 3, name: 'item 1'},
      ],
    });

    const results = db.find((value) => value.name === 'item 1');

    expect(results).toHaveLength(2);
    expect(results[0]).toEqual({value: {id: 1, name: 'item 1'}, path: 'items.0'});
    expect(results[1]).toEqual({value: {id: 3, name: 'item 1'}, path: 'items.2'});
  });

  test('should handle array updates in watch', async () => {
    const db = GPTDB(TEST_DB_PATH, {
      bookings: [
        {id: 1, name: 'Alice'},
        {id: 2, name: 'Bob'},
        {id: 3, name: 'Alise'},
        {id: 4, name: 'Alice'},
      ],
    });

    const callback = jest.fn();
    db.watch('bookings', callback);

    db.data.bookings.push({id: 5, name: 'Ralph'});

    expect(callback).toHaveBeenCalledTimes(0);

    db.data.bookings = [...db.data.bookings, {id: 6, name: 'Rudolph'}];

    expect(callback).toHaveBeenCalledTimes(1);

    expect(callback).toHaveBeenCalledWith(
      [
        {id: 1, name: 'Alice'},
        {id: 2, name: 'Bob'},
        {id: 3, name: 'Alise'},
        {id: 4, name: 'Alice'},
        {id: 5, name: 'Ralph'}
      ],
      [
        {id: 1, name: 'Alice'},
        {id: 2, name: 'Bob'},
        {id: 3, name: 'Alise'},
        {id: 4, name: 'Alice'},
        {id: 5, name: 'Ralph'},
        {id: 6, name: 'Rudolph'}
      ]
    );
  });

  test('should stop calling watcher after remove is called', async () => {
    const db = GPTDB(TEST_DB_PATH, {value: 'test', something: {name: 'chat'}});

    const callback = jest.fn();
    const watcher = db.watch('something.name', callback);

    db.data.something.name = 'new name';
    watcher.remove();
    db.data.something.name = 'another name';

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('chat', 'new name');
  });
});
