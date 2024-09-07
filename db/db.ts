// app/db/db.ts

import {
  ResultSet,
  SQLiteDatabase,
  enablePromise,
  openDatabase,
} from 'react-native-sqlite-storage';

// Enable promise for SQLite
enablePromise(true);

export const connectToDatabase = async () => {
  return openDatabase(
    {name: 'CoffeeCounter.db'},
    () => {},
    error => {
      console.error(error);
      throw Error('Could not connect to database');
    },
  );
};

export const createTables = async (db: SQLiteDatabase) => {
  const databaseInitiationCommands = [
    ` 
      CREATE TABLE IF NOT EXISTS CoffeeDay(
        id INTEGER PRIMARY KEY,
        createdOn INTEGER DEFAULT (strftime('%s','now')),
        modifiedOn INTEGER DEFAULT (strftime('%s','now')),
        
        amount INTEGER NOT NULL
      );
    `,
  ];
  try {
    for (let command of databaseInitiationCommands) {
      await db.executeSql(command);
    }

    // await db.executeSql(userPreferencesQuery);
    // await db.executeSql(contactsQuery);
  } catch (error) {
    console.error(error);
    throw Error(`Failed to initialize database`);
  }
};

export const getTableNames = async (db: SQLiteDatabase): Promise<string[]> => {
  try {
    const tableNames: string[] = [];
    const results = await db.executeSql(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'",
    );
    results?.forEach(result => {
      for (let index = 0; index < result.rows.length; index++) {
        tableNames.push(result.rows.item(index).name);
      }
    });
    return tableNames;
  } catch (error) {
    console.error(error);
    throw Error('Failed to get table names from database');
  }
};

export const getCoffeeDays = async (db: SQLiteDatabase): Promise<any[]> => {
  try {
    const coffeeDays: any[] = [];
    const queryResults = await db.executeSql('SELECT * FROM coffeeDay');
    queryResults?.forEach(result => {
      for (let index = 0; index < result.rows.length; index++) {
        console.log(result.rows.item(index));
        coffeeDays.push(result.rows.item(index));
      }
    });
    console.log(coffeeDays);
    return coffeeDays;
  } catch (error) {
    console.error(error);
    throw Error('Failed to get coffee days from database');
  }
};

export const createCoffeeDay = async (db: SQLiteDatabase): Promise<void> => {
  try {
    const queryResult = await db.executeSql(
      `INSERT INTO CoffeeDay(createdOn, modifiedOn, amount) VALUES (?, ?, ?)`,
      [Date.now(), Date.now(), 1],
    );

    return queryResult[0].rows.item(0);
  } catch (error) {
    console.error(error);
    throw Error('Failed to create transaction');
  }
};
// Code from example

export const updateCoffeeDay = async (
  db: SQLiteDatabase,
  currentCoffeeDay: any,
): Promise<void> => {
  try {
    const queryResult = await db.executeSql(
      `UPDATE CoffeeDay SET amount = ? WHERE id = ?`,
      [currentCoffeeDay.amount + 1, currentCoffeeDay.id],
    );
  } catch (error) {
    console.error(error);
    throw Error('Failed to update coffee day');
  }
};

export const addCoffeeInDb = async (db: SQLiteDatabase): Promise<void> => {
  const allCoffeeDays: any[] = await getCoffeeDays(db);

  const todaysCoffeeDay = allCoffeeDays.find(
    coffeeDay =>
      new Date().setHours(0, 0, 0, 0) ===
      new Date(coffeeDay.createdOn).setHours(0, 0, 0, 0),
  );

  if (todaysCoffeeDay) {
    await updateCoffeeDay(db, todaysCoffeeDay);
  }

  await createCoffeeDay(db);
};

export const getTodaysCoffeeAmount = async (
  db: SQLiteDatabase,
): Promise<number> => {
  const allCoffeeDays: any[] = await getCoffeeDays(db);

  const todaysCoffeeDay = allCoffeeDays.find(
    coffeeDay =>
      new Date().setHours(0, 0, 0, 0) ===
      new Date(coffeeDay.createdOn).setHours(0, 0, 0, 0),
  );

  return todaysCoffeeDay.amount;
};

export const getYesterdaysCoffeeAmount = async (
  db: SQLiteDatabase,
): Promise<number> => {
  const allCoffeeDays: any[] = await getCoffeeDays(db);

  const yesterday: Date = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  const yesterdaysCoffeeDay = allCoffeeDays.find(coffeeDay => {
    const coffeeDayDate = new Date(coffeeDay.createdOn);
    coffeeDayDate.setHours(0, 0, 0, 0);

    return yesterday.getTime() == coffeeDayDate.getTime();
  });

  try {
    return yesterdaysCoffeeDay.amount;
  } catch (e) {
    console.error('ERROR: ', e);
    return 0;
  }
};
type Table = 'Contacts' | 'UserPreferences';

export const removeTable = async (db: SQLiteDatabase, tableName: Table) => {
  const query = `DROP TABLE IF EXISTS ${tableName}`;
  try {
    await db.executeSql(query);
  } catch (error) {
    console.error(error);
    throw Error(`Failed to drop table ${tableName}`);
  }
};
