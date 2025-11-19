import {config} from 'dotenv';

// modules:
import {HealthModule} from './health';

config();

const {
	PORT,
	DATABASE_NAME,
	DATABASE_USER,
	DATABASE_PASSWORD,
	DATABASE_HOST,
	DATABASE_PORT,
	DATABASE_SSL
} = process.env;

import {Application} from './app';
import {DatabaseConfig} from './database-config';

const modules = [
	new HealthModule(),
];

const databaseConfig: DatabaseConfig = {
	database: DATABASE_NAME,
	user: DATABASE_USER,
	password: DATABASE_PASSWORD,
	host: DATABASE_HOST,
	port: Number(DATABASE_PORT),
	ssl: DATABASE_SSL === 'true'
};

const app = new Application(
	PORT,
	modules,
	databaseConfig
);

app.init();
