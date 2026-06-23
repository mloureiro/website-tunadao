import { getPayload } from 'payload';
import config from '@payload-config';
import type { RebuildStatus } from '../../payload-types';

function formatTimestamp(ts: string | null | undefined): string {
  if (!ts) return '—';
  try {
    return new Date(ts).toLocaleString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return ts;
  }
}

export default async function RebuildStatusWidget() {
  const payload = await getPayload({ config });
  const status = (await payload.findGlobal({
    slug: 'rebuild-status',
    overrideAccess: true,
  })) as RebuildStatus;

  const hasOutcome = Boolean(status?.outcome);

  // --- styles (inline, minimal) ---
  const cardStyle: React.CSSProperties = {
    fontFamily: 'inherit',
    fontSize: '14px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '16px 20px',
    marginBottom: '20px',
    background: '#fff',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '12px',
    fontWeight: 600,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    color: '#64748b',
    marginBottom: '12px',
    display: 'block',
  };

  const badgeBase: React.CSSProperties = {
    display: 'inline-block',
    borderRadius: '9999px',
    padding: '2px 10px',
    fontWeight: 700,
    fontSize: '12px',
    marginRight: '8px',
  };

  const badges: Record<string, React.CSSProperties> = {
    success: { ...badgeBase, background: '#dcfce7', color: '#166534' },
    failure: { ...badgeBase, background: '#fee2e2', color: '#991b1b' },
    skipped: { ...badgeBase, background: '#fef9c3', color: '#854d0e' },
    empty: { ...badgeBase, background: '#f1f5f9', color: '#475569' },
  };

  const rowStyle: React.CSSProperties = {
    display: 'flex',
    gap: '8px',
    alignItems: 'flex-start',
    marginTop: '8px',
    flexWrap: 'wrap',
  };

  const metaStyle: React.CSSProperties = {
    color: '#64748b',
    fontSize: '13px',
  };

  const errorBoxStyle: React.CSSProperties = {
    marginTop: '8px',
    padding: '8px 12px',
    background: '#fff1f2',
    border: '1px solid #fecdd3',
    borderRadius: '4px',
    fontSize: '12px',
    color: '#9f1239',
    fontFamily: 'monospace',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
    maxHeight: '120px',
    overflowY: 'auto',
  };

  // --- Empty state ---
  if (!hasOutcome) {
    return (
      <div style={cardStyle}>
        <span style={labelStyle}>Último Rebuild do Site</span>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={badges.empty}>—</span>
          <span style={metaStyle}>Ainda não foi despoletado nenhum rebuild.</span>
        </div>
      </div>
    );
  }

  const outcome = status.outcome as 'success' | 'failure' | 'skipped';
  const badgeLabels: Record<string, string> = {
    success: 'Sucesso',
    failure: 'Falha',
    skipped: 'Ignorado',
  };

  return (
    <div style={cardStyle}>
      <span style={labelStyle}>Último Rebuild do Site</span>

      {/* Status row */}
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
        <span style={badges[outcome]}>{badgeLabels[outcome] ?? outcome}</span>
        {status.workflowFile && (
          <span style={{ ...metaStyle, fontFamily: 'monospace' }}>{status.workflowFile}</span>
        )}
      </div>

      {/* Meta row */}
      <div style={rowStyle}>
        {status.timestamp && (
          <span style={metaStyle}>
            <strong>Data:</strong> {formatTimestamp(status.timestamp)}
          </span>
        )}
        {(status.triggerCollection || status.triggerOperation) && (
          <span style={metaStyle}>
            <strong>Origem:</strong>{' '}
            {[status.triggerCollection, status.triggerOperation].filter(Boolean).join(' · ')}
          </span>
        )}
        {status.httpStatus != null && (
          <span style={metaStyle}>
            <strong>HTTP:</strong> {status.httpStatus}
          </span>
        )}
      </div>

      {/* Skipped note */}
      {outcome === 'skipped' && (
        <div style={{ ...metaStyle, marginTop: '6px', fontStyle: 'italic' }}>
          Credenciais GitHub não configuradas — o rebuild não foi enviado.
        </div>
      )}

      {/* Error detail */}
      {outcome === 'failure' && status.errorDetail && (
        <div style={errorBoxStyle}>{status.errorDetail}</div>
      )}
    </div>
  );
}
