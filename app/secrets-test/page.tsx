export default async function SecretsTestPage() {
  let diagnosticData = null;
  let secretsData = null;
  let errors = { diagnostic: null as string | null, secrets: null as string | null };

  try {
    const diagRes = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/secrets-diagnostic`, {
      cache: 'no-store',
    });
    diagnosticData = await diagRes.json();
  } catch (error) {
    errors.diagnostic = error instanceof Error ? error.message : 'Unknown error';
  }

  try {
    const secretsRes = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/test-karlas-secrets`, {
      cache: 'no-store',
    });
    secretsData = await secretsRes.json();
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
        <h2>Karla's Test Secrets</h2>
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
