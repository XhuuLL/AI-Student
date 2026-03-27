import mongoose from "mongoose";
import { env, requireEnv } from "@/lib/env";

const globalForMongoose = global as unknown as {
  mongooseConn?: typeof mongoose | null;
};

export async function connectToDb() {
  if (globalForMongoose.mongooseConn && globalForMongoose.mongooseConn.connection.readyState === 1) {
    return globalForMongoose.mongooseConn;
  }

  mongoose.set("strictQuery", true);
  const mongoUri = env.MONGODB_URI ?? requireEnv("MONGODB_URI");
  const conn = await mongoose.connect(mongoUri, {
    autoIndex: true,
  });
  globalForMongoose.mongooseConn = conn;
  return conn;
}

