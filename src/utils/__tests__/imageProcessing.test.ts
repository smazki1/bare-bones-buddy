import { describe, it, expect, vi, beforeEach } from 'vitest';
import { uploadCategoryIcon, uploadAndProcessImage, uploadProjectImages } from '@/utils/imageProcessing';

vi.mock('@/integrations/supabase/client', () => {
  const storageUpload = vi.fn(async () => ({ data: {}, error: null }));
  const getPublicUrl = vi.fn(() => ({ data: { publicUrl: 'https://cdn.example/icon.jpg' } }));
  const functionsInvoke = vi.fn(async () => ({ data: { urls: { thumbnail: 'thumb', large: 'large' } }, error: null }));
  const rpc = vi.fn(async () => ({ data: true, error: null }));
  return {
    supabase: {
      storage: { from: vi.fn(() => ({ upload: storageUpload, getPublicUrl })) },
      functions: { invoke: functionsInvoke },
      rpc,
    }
  };
});

import { supabase } from '@/integrations/supabase/client';

const makeFile = (name = 'a.jpg') => new File([new Uint8Array([1,2,3])], name, { type: 'image/jpeg' });

describe('imageProcessing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uploadCategoryIcon - happy path', async () => {
    const url = await uploadCategoryIcon(makeFile());
    expect(supabase.rpc).toHaveBeenCalledWith('link_admin_user');
    expect(url).toBe('https://cdn.example/icon.jpg');
  });

  it('uploadCategoryIcon - retries on permission error once', async () => {
    const upload = (supabase.storage.from as any)().upload as any;
    upload.mockResolvedValueOnce({ data: null, error: { code: '42501', message: 'permission denied' } });
    upload.mockResolvedValueOnce({ data: {}, error: null });

    const url = await uploadCategoryIcon(makeFile());
    expect(url).toBe('https://cdn.example/icon.jpg');
    expect(upload).toHaveBeenCalledTimes(2);
  });

  it('uploadAndProcessImage - happy path', async () => {
    const res = await uploadAndProcessImage(makeFile('b.jpg'), 'project-images', 'before');
    expect(res.original).toContain('http');
    expect(res.large).toBe('large');
    expect(res.thumbnail).toBe('thumb');
  });

  it('uploadAndProcessImage - process error surfaced', async () => {
    const invoke = supabase.functions.invoke as any;
    invoke.mockResolvedValueOnce({ data: null, error: { message: 'fail' } });
    await expect(uploadAndProcessImage(makeFile('c.jpg'), 'project-images', 'after'))
      .rejects.toThrow('Failed to upload and process image');
  });

  it('uploadProjectImages - returns mapped urls', async () => {
    const res = await uploadProjectImages(makeFile('d.jpg'), makeFile('e.jpg'));
    expect(res.beforeUrl).toContain('http');
    expect(res.afterUrl).toBe('large');
    expect(res.afterThumbUrl).toBe('thumb');
  });
});


