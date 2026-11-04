export function databaseConfig(env=process.env) {
  for (const key of ['DB_NAME','DB_USER','DB_PASSWORD']) if (!env[key]) throw new Error(`Missing ${key}; MySQL is required`);
  const port = Number(env.DB_PORT || 3306);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid DB_PORT');
  return {host:env.DB_HOST || '127.0.0.1',port,user:env.DB_USER,password:env.DB_PASSWORD,database:env.DB_NAME,waitForConnections:true,connectionLimit:10,decimalNumbers:true};
}
