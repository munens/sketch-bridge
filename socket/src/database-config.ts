export interface DatabaseConfig {
	// Support for connection string (Railway default)
	connectionString?: string;
	
	// Support for individual credentials (local development)
	database?: string;
	user?: string;
	password?: string;
	host?: string;
	port?: number;
	ssl?: boolean;
}

