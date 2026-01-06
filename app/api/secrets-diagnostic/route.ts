export async function GET() {
  const envVars = {
    SITE_SECRETS_DEFAULT: process.env.SITE_SECRETS_DEFAULT || 'not set',
    SITE_SECRETS_PRODUCTION: process.env.SITE_SECRETS_PRODUCTION || 'not set',
    PANTHEON_ENVIRONMENT: process.env.PANTHEON_ENVIRONMENT || 'not set',
    NODE_ENV: process.env.NODE_ENV || 'not set',
  };

  let parsedDefault = null;
  let parsedProduction = null;
  let parseErrors = {
    default: null as string | null,
    production: null as string | null,
  };

  try {
    if (envVars.SITE_SECRETS_DEFAULT !== 'not set') {
      parsedDefault = JSON.parse(envVars.SITE_SECRETS_DEFAULT);
    }
  } catch (error) {
    parseErrors.default = error instanceof Error ? error.message : 'Unknown error';
  }

  try {
    if (envVars.SITE_SECRETS_PRODUCTION !== 'not set') {
      parsedProduction = JSON.parse(envVars.SITE_SECRETS_PRODUCTION);
    }
  } catch (error) {
    parseErrors.production = error instanceof Error ? error.message : 'Unknown error';
  }

  return Response.json({
    environment: {
      pantheon: envVars.PANTHEON_ENVIRONMENT,
      node: envVars.NODE_ENV,
    },
    rawEnvVars: {
      SITE_SECRETS_DEFAULT: envVars.SITE_SECRETS_DEFAULT.substring(0, 100) + (envVars.SITE_SECRETS_DEFAULT.length > 100 ? '...' : ''),
      SITE_SECRETS_PRODUCTION: envVars.SITE_SECRETS_PRODUCTION.substring(0, 100) + (envVars.SITE_SECRETS_PRODUCTION.length > 100 ? '...' : ''),
    },
    parsedSecrets: {
      default: parsedDefault,
      production: parsedProduction,
    },
    parseErrors,
  }, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
