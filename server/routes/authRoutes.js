// /server/routes/authRoutes.js
import express from "express";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oidc";
import pool from "../config/database.js"; // Ensure you have the correct path to your database config

const router = express.Router();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/oauth2/redirect/google',
    scope: ['profile']
}, async function verify(issuer, profile, cb) {
    try {
        const { rows } = await pool.query('SELECT * FROM federated_credentials WHERE provider = $1 AND subject = $2', [issuer, profile.id]);
        if (rows.length === 0) {
            const userResult = await pool.query('INSERT INTO users (name) VALUES ($1) RETURNING id', [profile.displayName]);
            const userId = userResult.rows[0].id;
            await pool.query('INSERT INTO federated_credentials (user_id, provider, subject) VALUES ($1, $2, $3)', [userId, issuer, profile.id]);
            const user = {
                id: userId,
                name: profile.displayName
            };
            return cb(null, user);
        } else {
            const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [rows[0].user_id]);
            if (userResult.rows.length === 0) {
                return cb(null, false);
            }
            return cb(null, userResult.rows[0]);
        }
    } catch (err) {
        return cb(err);
    }
}));

passport.serializeUser(function(user, cb) {
    process.nextTick(function() {
        cb(null, { id: user.id, username: user.username, name: user.name });
    });
});

passport.deserializeUser(function(user, cb) {
    process.nextTick(function() {
        return cb(null, user);
    });
});

router.get('/login', function(req, res, next) {
    try {
        res.render('auth/login', { layout: "./auth/login" });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching blog posts');
    }
});

router.get('/login/federated/google', passport.authenticate('google'));

router.get('/oauth2/redirect/google', passport.authenticate('google', {
    failureRedirect: '/login',
    successRedirect: '/'
}));

export default router;
