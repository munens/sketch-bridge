import cors from 'cors';
import {config} from 'dotenv';

config();

export function corsHandler() {
	return cors({
		origin: process.env.CLIENT_URL,
		methods: ['GET', 'POST', 'PUT', 'DELETE']
	});
}
