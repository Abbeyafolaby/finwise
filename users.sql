CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    google_id VARCHAR(255) UNIQUE,
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE users ADD COLUMN name VARCHAR(255);

CREATE TABLE federated_credentials (
    user_id INT REFERENCES users(id),
    provider VARCHAR(255),
    subject VARCHAR(255),
    PRIMARY KEY (provider, subject)
);

CREATE TABLE session (
    sid VARCHAR NOT NULL PRIMARY KEY,
    sess JSON NOT NULL,
    expire TIMESTAMP(6) NOT NULL
);


CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    name VARCHAR(255),
    type VARCHAR(10) CHECK (type IN ('income', 'expense'))
);

CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    category_id INT REFERENCES categories(id),
    amount DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT NOW()
);
