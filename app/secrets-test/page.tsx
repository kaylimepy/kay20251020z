interface SecretObject {
  value?: string;
  [key: string]: unknown;
}

function getDiagnosticData() {
  const envVars = {
    SITE_SECRETS_DEFAULT: process.env.SITE_SECRETS_DEFAULT || 'not set',
    SITE_SECRETS_PRODUCTION: process.env.SITE_SECRETS_PRODUCTION || 'not set',
    PANTHEON_ENVIRONMENT: process.env.PANTHEON_ENVIRONMENT || 'not set',
    PANTHEON_ENV: process.env.PANTHEON_ENV || 'not set',
    ENV: process.env.ENV || 'not set',
    ENVIRONMENT: process.env.ENVIRONMENT || 'not set',
    NODE_ENV: process.env.NODE_ENV || 'not set',
    VERCEL_ENV: process.env.VERCEL_ENV || 'not set',
  };

  let parsedDefault = null;
  let parsedProduction = null;
  const parseErrors = {
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

  return {
    environment: {
      pantheon: envVars.PANTHEON_ENVIRONMENT,
      pantheonEnv: envVars.PANTHEON_ENV,
      env: envVars.ENV,
      environment: envVars.ENVIRONMENT,
      node: envVars.NODE_ENV,
      vercel: envVars.VERCEL_ENV,
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
  };
}

function getSecretsData() {
  const secretNames = ['KARLAS_TEST_1', 'KARLAS_TEST_2', 'KARLAS_TEST_3'];
  const environment = process.env.PANTHEON_ENVIRONMENT || process.env.PANTHEON_ENV || process.env.ENV || process.env.ENVIRONMENT || 'unknown';

  let secrets: Record<string, SecretObject> = {};
  let sourceUsed = 'none';
  let rawData = '';

  try {
    if (process.env.SITE_SECRETS_DEFAULT) {
      const parsed = JSON.parse(process.env.SITE_SECRETS_DEFAULT);
      secrets = parsed;
      sourceUsed = 'SITE_SECRETS_DEFAULT';
      rawData = process.env.SITE_SECRETS_DEFAULT.substring(0, 200);
    } else if (process.env.SITE_SECRETS_PRODUCTION) {
      const parsed = JSON.parse(process.env.SITE_SECRETS_PRODUCTION);
      secrets = parsed;
      sourceUsed = 'SITE_SECRETS_PRODUCTION';
      rawData = process.env.SITE_SECRETS_PRODUCTION.substring(0, 200);
    }
  } catch (error) {
    return {
      error: 'Failed to parse secrets',
      message: error instanceof Error ? error.message : 'Unknown error',
      environment,
    };
  }

  const results = secretNames.map(name => {
    const secret = secrets[name];
    if (!secret) {
      return {
        name,
        baseValue: 'not found',
        resolvedValue: 'not found',
        hasOverride: false,
        fullObject: null,
      };
    }

    const baseValue = secret.value as string || 'not found';
    const envValues = (secret as { envValues?: Record<string, string> }).envValues;
    const overrideValue = envValues?.[environment];
    const resolvedValue = overrideValue || baseValue;

    return {
      name,
      baseValue,
      overrideValue: overrideValue || 'none',
      resolvedValue,
      hasOverride: !!overrideValue,
      fullObject: secret,
    };
  });

  return {
    environment,
    detectedEnvVars: {
      PANTHEON_ENVIRONMENT: process.env.PANTHEON_ENVIRONMENT || 'not set',
      PANTHEON_ENV: process.env.PANTHEON_ENV || 'not set',
      ENV: process.env.ENV || 'not set',
      ENVIRONMENT: process.env.ENVIRONMENT || 'not set',
    },
    sourceUsed,
    rawDataPreview: rawData,
    secretsFound: Object.keys(secrets).length,
    requestedSecrets: results,
    allAvailableSecrets: Object.keys(secrets),
  };
}

export default async function SecretsTestPage() {
  let diagnosticData = null;
  let secretsData = null;
  const errors = { diagnostic: null as string | null, secrets: null as string | null };

  try {
    diagnosticData = getDiagnosticData();
  } catch (error) {
    errors.diagnostic = error instanceof Error ? error.message : 'Unknown error';
  }

  try {
    secretsData = getSecretsData();
  } catch (error) {
    errors.secrets = error instanceof Error ? error.message : 'Unknown error';
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'monospace' }}>
      <h1>Pantheon Secrets Test</h1>

      <section style={{ marginTop: '2rem', padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
        <h2>Environment Info</h2>
        {diagnosticData && (
          <pre style={{ overflow: 'auto' }}>
            {JSON.stringify(diagnosticData.environment, null, 2)}
          </pre>
        )}
      </section>

      <section style={{ marginTop: '2rem', padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
        <h2>Diagnostic Data</h2>
        {errors.diagnostic ? (
          <p style={{ color: 'red' }}>Error: {errors.diagnostic}</p>
        ) : (
          <pre style={{ overflow: 'auto', fontSize: '12px' }}>
            {JSON.stringify(diagnosticData, null, 2)}
          </pre>
        )}
      </section>

      <section style={{ marginTop: '2rem', padding: '1rem', background: '#e3f2fd', borderRadius: '8px' }}>
        <h2>Karla&apos;s Test Secrets</h2>
        {errors.secrets ? (
          <p style={{ color: 'red' }}>Error: {errors.secrets}</p>
        ) : (
          <>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Environment:</strong> {secretsData?.environment}<br />
              <strong>Source Used:</strong> {secretsData?.sourceUsed}<br />
              <strong>Secrets Found:</strong> {secretsData?.secretsFound}
            </div>
            <h3>Requested Secrets:</h3>
            <pre style={{ overflow: 'auto', fontSize: '12px' }}>
              {JSON.stringify(secretsData?.requestedSecrets, null, 2)}
            </pre>
            <h3>All Available Secrets:</h3>
            <pre style={{ overflow: 'auto', fontSize: '12px' }}>
              {JSON.stringify(secretsData?.allAvailableSecrets, null, 2)}
            </pre>
          </>
        )}
      </section>
    </div>
  );
}
