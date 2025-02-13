const dotenv = require('dotenv');
const env = dotenv.config();
if (env.error) {
  throw new Error('Error loading .env file', env.error);
}

console.log('>>>>>>>>>>>>>> env >>>>>>>>>>>>>>>>>', env);

const fs = require('fs');

const path = require('path');

// Path to the .env file
const envPath = path.resolve(__dirname, '../.env');

// REDIS_HOST=127.0.0.1
// REDIS_PORT=6379
// REDIS_PASS=
// REDIS_SSL_ENABLED=false
// REDIS_DEPLOYMENT_TYPE=single
// REDIS_DB=0
// REDIS_PREFIX=integration-service:

const createRedisUrl = () => {
  try {
    const deploymentType = process.env.REDIS_DEPLOYMENT_TYPE || 'single';

    if (deploymentType === 'cluster') {
      const clusterNodes = process.env.REDIS_CLUSTER_NODES;
      const password = process.env.REDIS_PASS
        ? `:${process.env.REDIS_PASS}@`
        : '';
      return `redis${
        process.env.REDIS_SSL_ENABLED === 'true' ? 's' : ''
      }+cluster://${password}${clusterNodes}`;
    } else if (deploymentType === 'sentinel') {
      const sentinelNodes = process.env.REDIS_SENTINEL_NODES;
      const password = process.env.REDIS_PASS
        ? `:${process.env.REDIS_PASS}@`
        : '';
      const name = process.env.REDIS_NAME || '';
      const role = process.env.REDIS_ROLE
        ? `?role=${process.env.REDIS_ROLE}`
        : '';
      const db = process.env.REDIS_DB ? `&db=${process.env.REDIS_DB}` : '';
      return `redis${
        process.env.REDIS_SSL_ENABLED === 'true' ? 's' : ''
      }+sentinel://${password}${sentinelNodes}/${name}${role}${db}`;
    } else {
      const host = process.env.REDIS_HOST;
      const port = process.env.REDIS_PORT;
      const password = process.env.REDIS_PASS
        ? `:${process.env.REDIS_PASS}@`
        : '';
      const db = process.env.REDIS_DB ? `/${process.env.REDIS_DB}` : '';
      return `redis${
        process.env.REDIS_SSL_ENABLED === 'true' ? 's' : ''
      }://${password}${host}:${port}${db}`;
    }
  } catch (err) {
    throw new Error('Invalid configuration', err);
  }
};

// Function to update .env variables
function updateEnvVariable(key, value) {
  // Load existing .env variables
  const envConfig = dotenv.parse(fs.readFileSync(envPath));

  // Update or add the key-value pair
  envConfig[key] = value;

  // Convert the object back to a string
  const updatedEnv = Object.entries(envConfig)
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');

  // Write the updated .env file
  fs.writeFileSync(envPath, updatedEnv);

  // Reload the environment variables
  dotenv.config({ path: envPath });
}

// Example usage
const redisUrl = createRedisUrl();
updateEnvVariable('REDIS_URL', redisUrl);
console.log(
  '>>>>>>>>>>>>>> process.env.REDIS_URL >>>>>>>>>>>>>>>>>',
  process.env.REDIS_URL
); // Output: 12345
