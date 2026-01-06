export async function GET() {
  const secretNames = ['KARLAS_TEST_1', 'KARLAS_TEST_2', 'KARLAS_TEST_3'];

  const environment = process.env.PANTHEON_ENVIRONMENT || 'unknown';

  let secrets: Record<string, any> = {};
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
    return Response.json({
      error: 'Failed to parse secrets',
      message: error instanceof Error ? error.message : 'Unknown error',
      environment,
    }, { status: 500 });
  }

  const results = secretNames.map(name => ({
    name,
    value: secrets[name]?.value || 'not found',
    fullObject: secrets[name] || null,
  }));

  return Response.json({
    environment,
    sourceUsed,
    rawDataPreview: rawData,
    secretsFound: Object.keys(secrets).length,
    requestedSecrets: results,
    allAvailableSecrets: Object.keys(secrets),
  });
}
