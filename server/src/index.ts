require("dotenv").config();
import "reflect-metadata";
import express from "express";
import { createConnection } from "typeorm";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import mongoose from "mongoose";
import MongoStore from "connect-mongo";
import session from "express-session";
import cors from "cors";

import { User } from "./entities/User";
import { Post } from "./entities/Post";
import { UserResolver } from "./resolvers/user";
import { COOKIE_NAME, __prod__ } from "./constants";
import { Context } from "./types/Context";
import { PostResolver } from "./resolvers/post";

const main = async () => {
  await createConnection({
    type: "postgres",
    database: "reddit",
    username: process.env.DB_USERNAME_DEV,
    password: process.env.DB_PASSWORD_DEV,
    logging: true,
    synchronize: true,
    entities: [User, Post],
  });

  const app = express();

  app.use(
    cors({
      origin: __prod__
        ? process.env.CORS_ORIGIN_PROD
        : process.env.CORS_ORIGIN_DEV,
      credentials: true,
    })
  );

  // Session storage
  const mongoUrl = `mongodb+srv://${process.env.SESSION_DB_USERNAME_DEV}:${process.env.SESSION_DB_PASSWORD_DEV}@cluster0.q8gw6.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

  await mongoose.connect(mongoUrl, {
    autoIndex: true,
    autoCreate: true,
  });

  app.set("trust proxy", 1);

  app.use(
    session({
      name: COOKIE_NAME,
      store: MongoStore.create({ mongoUrl }),
      cookie: {
        maxAge: 1000 * 60,
        httpOnly: true, // FE cannot access the cookie
        secure: __prod__,
        sameSite: "strict", // protection against CSRF attacks
      },
      resave: false,
      secret: process.env.SESSION_SECRET_DEV as string,
      saveUninitialized: false, // don't save empty session'
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [UserResolver, PostResolver],
      validate: false,
    }),
    context: ({ req, res }): Context => ({ req, res }),
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
  });

  await apolloServer.start();

  apolloServer.applyMiddleware({ app, cors: false });

  const PORT = process.env.PORT || 4000;

  app.listen(PORT, () =>
    console.log(
      `Server start at port ${PORT}. GraphQL server started on localhost: ${PORT}${apolloServer.graphqlPath}`
    )
  );
};

main().catch((error) => console.log(error));
