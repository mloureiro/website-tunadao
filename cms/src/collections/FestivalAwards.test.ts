import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the rebuild utility before importing the collection
vi.mock('../utils/triggerRebuild', () => ({
  triggerFrontendRebuild: vi.fn().mockResolvedValue(undefined),
}));

import { FestivalAwards } from './FestivalAwards';
import { triggerFrontendRebuild } from '../utils/triggerRebuild';

// The afterChange hook under test
const hook = FestivalAwards.hooks?.afterChange?.[0];
if (!hook) throw new Error('FestivalAwards afterChange[0] hook not found');

type FindByID = (args: { collection: string; id: unknown }) => Promise<{ status: string }>;

function makeReq(findByID: FindByID): { payload: { findByID: FindByID } } {
  return { payload: { findByID } };
}

function makeDoc(festivalValue: unknown): Record<string, unknown> {
  return { festival: festivalValue };
}

describe('FestivalAwards afterChange guard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('triggers rebuild when parent festival is published (id as number)', async () => {
    const findByID = vi.fn().mockResolvedValue({ status: 'published' });
    const doc = makeDoc(5);
    await hook({ doc, operation: 'update', req: makeReq(findByID) } as Parameters<typeof hook>[0]);

    expect(findByID).toHaveBeenCalledWith({ collection: 'festivals', id: 5 });
    expect(triggerFrontendRebuild).toHaveBeenCalledOnce();
  });

  it('triggers rebuild when parent festival is published (festival as populated object)', async () => {
    const findByID = vi.fn().mockResolvedValue({ status: 'published' });
    const doc = makeDoc({ id: 5, name: 'Festival X' });
    await hook({ doc, operation: 'create', req: makeReq(findByID) } as Parameters<typeof hook>[0]);

    expect(findByID).toHaveBeenCalledWith({ collection: 'festivals', id: 5 });
    expect(triggerFrontendRebuild).toHaveBeenCalledOnce();
  });

  it('does NOT trigger rebuild when parent festival is draft', async () => {
    const findByID = vi.fn().mockResolvedValue({ status: 'draft' });
    const doc = makeDoc(5);
    await hook({ doc, operation: 'update', req: makeReq(findByID) } as Parameters<typeof hook>[0]);

    expect(triggerFrontendRebuild).not.toHaveBeenCalled();
  });

  it('does NOT trigger rebuild and does NOT throw when findByID rejects (parent not found)', async () => {
    const findByID = vi.fn().mockRejectedValue(new Error('not found'));
    const doc = makeDoc(5);

    // Should resolve without throwing
    await expect(
      hook({ doc, operation: 'update', req: makeReq(findByID) } as Parameters<typeof hook>[0])
    ).resolves.toBe(doc);

    expect(triggerFrontendRebuild).not.toHaveBeenCalled();
  });

  it('does NOT trigger rebuild when doc.festival is null/undefined', async () => {
    const findByID = vi.fn();
    const doc = makeDoc(null);
    await hook({ doc, operation: 'update', req: makeReq(findByID) } as Parameters<typeof hook>[0]);

    expect(findByID).not.toHaveBeenCalled();
    expect(triggerFrontendRebuild).not.toHaveBeenCalled();
  });

  it('resolves to doc (return value is unchanged)', async () => {
    const findByID = vi.fn().mockResolvedValue({ status: 'published' });
    const doc = makeDoc(5);
    const result = await hook(
      { doc, operation: 'update', req: makeReq(findByID) } as Parameters<typeof hook>[0]
    );

    expect(result).toBe(doc);
  });
});
