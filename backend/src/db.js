const sql = require('mssql');
const { DefaultAzureCredential, ManagedIdentityCredential } = require('@azure/identity');

// Database configuration
const config = {
    server: 'appointment-sql-server.database.windows.net',
    database: 'appointmentDB',
    options: {
        encrypt: true,
        enableArithAbort: true,
        trustServerCertificate: false
    },
    connectionTimeout: 30000,
    requestTimeout: 30000,
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

let pool;

// Get access token for Azure SQL
async function getAccessToken() {
    try {
        let credential;
        
        if (process.env.AZURE_CLIENT_ID || process.env.WEBSITE_SITE_NAME) {
            // Running in Azure (production)
            credential = new ManagedIdentityCredential();
            console.log('Using ManagedIdentityCredential for Azure environment');
        } else {
            // Running locally (development)
            credential = new DefaultAzureCredential();
            console.log('Using DefaultAzureCredential for local development');
        }

        const tokenResponse = await credential.getToken('https://database.windows.net/');
        console.log('✅ Successfully obtained access token');
        return tokenResponse.token;
    } catch (error) {
        console.error('❌ Failed to get access token:', error.message);
        throw error;
    }
}

// Create database connection with AAD token
async function getPool() {
    if (!pool) {
        try {
            console.log('🔐 Getting Azure AD access token...');
            const accessToken = await getAccessToken();
            
            console.log('🔌 Connecting to database with AAD token...');
            
            // Add authentication to config
            const configWithAuth = {
                ...config,
                authentication: {
                    type: 'azure-active-directory-access-token',
                    options: {
                        token: accessToken
                    }
                }
            };

            pool = await sql.connect(configWithAuth);
            console.log('✅ Connected to Azure SQL Database using AAD');
            
        } catch (err) {
            console.error('❌ DB connection failed:', err.message);
            throw err;
        }
    }
    return pool;
}

// Execute query with parameters
async function executeQuery(query, params = {}) {
    try {
        const dbPool = await getPool();
        const request = dbPool.request();
        
        // Add parameters to prevent SQL injection
        Object.keys(params).forEach(key => {
            request.input(key, params[key]);
        });
        
        console.log('📊 Executing query:', query.substring(0, 100) + (query.length > 100 ? '...' : ''));
        if (Object.keys(params).length > 0) {
            console.log('📋 Parameters:', Object.keys(params));
        }
        
        const result = await request.query(query);
        console.log('✅ Query executed successfully');
        return result;
    } catch (error) {
        console.error('❌ Query execution error:', error.message);
        
        // If token expired, reset pool and retry once
        if (error.message.includes('token') || error.message.includes('authentication') || error.message.includes('login')) {
            console.log('🔄 Token might be expired, resetting connection...');
            await closePool();
            
            try {
                // Retry once
                const dbPool = await getPool();
                const request = dbPool.request();
                
                Object.keys(params).forEach(key => {
                    request.input(key, params[key]);
                });
                
                const result = await request.query(query);
                console.log('✅ Query retry successful');
                return result;
            } catch (retryError) {
                console.error('❌ Query retry failed:', retryError.message);
                throw retryError;
            }
        }
        
        throw error;
    }
}

// Close the connection pool
async function closePool() {
    if (pool) {
        try {
            await pool.close();
            pool = null;
            console.log('🔌 Database connection closed');
        } catch (error) {
            console.error('❌ Error closing pool:', error.message);
        }
    }
}

module.exports = {
    sql,
    getPool,
    executeQuery,
    closePool
};