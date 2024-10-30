import express from "express";
import bodyParser from "body-parser";
import index from "./server/routes/index.js";
import authRoutes from "./server/routes/authRoutes.js";
import session from "express-session";
import methodOverride from 'method-override';
import expressEjsLayouts from "express-ejs-layouts";
import pg from "pg";
import connectPgSimple from "connect-pg-simple";
import { setUser } from "./server/middleware/setUser.js";
import passport from "passport";

const app = express();
const PORT = process.env.PORT || 8080;

// PostgreSQL session store
const pgSession = connectPgSimple(session);
const pool = new pg.Pool({
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DATABASE,
    password: process.env.POSTGRES_PASSWORD,
    port: process.env.POSTGRES_PORT,
});

// set the view engine to ejs
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(methodOverride('_method'));
app.use(express.static("public"));

app.use(expressEjsLayouts);

app.use(session({
  store: new pgSession({
    pool: pool,
    tableName: 'session'
  }),
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
}));

// Initialize Passport and restore authentication state, if any, from the session.
app.use(passport.initialize());
app.use(passport.session());

// Use the setUser middleware
app.use(setUser);

app.use("/", index);
app.use("/", authRoutes);

app.listen(PORT, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});

