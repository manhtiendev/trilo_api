import { MongoClient, ServerApiVersion } from 'mongodb';
import { env } from '~/config/environment';

let triloDatabaseInstance = null;

const client = new MongoClient(env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationError: true,
  },
});

export const CONNECT_DB = async () => {
  await client.connect();

  triloDatabaseInstance = client.db(env.DATABASE_NAME);
};

export const GET_DB = () => {
  if (!triloDatabaseInstance) {
    throw new Error('Must connect to Database first!');
  }
  return triloDatabaseInstance;
};

export const CLOSE_DB = async () => {
  await client.close();
};
