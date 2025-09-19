import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminProjects from '@/pages/admin/projects';

// Simplify AdminLayout for tests
vi.mock('@/components/admin/AdminLayout', () => ({
  AdminLayout: ({ children }: any) => <div>{children}</div>
}));

const toastSpy = vi.fn();
vi.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: toastSpy }) }));

// Supabase mock with minimal chaining
const storageUpload = vi.fn(async () => ({ data: {}, error: null }));
const storageGetPublicUrl = vi.fn(() => ({ data: { publicUrl: 'https://cdn.example/image.jpg' } }));

// Define mocks inside factory to avoid hoist issues
vi.mock('@/integrations/supabase/client', () => {
  const api: any = {};
  api.select = vi.fn(() => api);
  api.order = vi.fn(() => ({ data: [], error: null }));
  api.eq = vi.fn(() => api);
  api.insert = vi.fn(async () => ({ error: null }));
  api.update = vi.fn(async () => ({ error: null }));
  api.delete = vi.fn(async () => ({ error: null }));

  return {
    supabase: {
      from: vi.fn(() => api),
      storage: { from: vi.fn(() => ({ upload: storageUpload, getPublicUrl: storageGetPublicUrl })) },
      rpc: vi.fn(async () => ({ data: true, error: null })),
    }
  };
});

import { supabase } from '@/integrations/supabase/client';
const fromAPI: any = (supabase.from as any)();
const rpcMock: any = supabase.rpc as any;

// Helper to open the form
async function openNewProjectForm() {
  render(<AdminProjects />);
  // Ensure list render is done
  const newBtn = await screen.findAllByText('פרויקט חדש');
  fireEvent.click(newBtn[0]);
}

const makeFile = (name = 'a.jpg') => new File([new Uint8Array([1,2,3])], name, { type: 'image/jpeg' });

describe('AdminProjects form', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // list queries
    fromAPI.order.mockImplementation(() => ({ data: [], error: null }));
    // uploads
    storageUpload.mockResolvedValue({ data: {}, error: null });
    storageGetPublicUrl.mockReturnValue({ data: { publicUrl: 'https://cdn.example/image.jpg' } });
    // inserts
    fromAPI.insert.mockResolvedValue({ error: null });
    fromAPI.update.mockResolvedValue({ error: null });
    // rpc
    rpcMock.mockResolvedValue({ data: true, error: null });
    // URL.createObjectURL for file preview safeness
    (global as any).URL.createObjectURL = vi.fn(() => 'blob://test');
  });

  it('creates a new project successfully (with images)', async () => {
    await openNewProjectForm();

    fireEvent.change(screen.getByLabelText('שם הפרויקט *'), { target: { value: 'My Project' } });
    fireEvent.change(screen.getByLabelText(/תמונה לפני/), { target: { files: [makeFile('before.jpg')] } as any });
    fireEvent.change(screen.getByLabelText(/תמונה אחרי/), { target: { files: [makeFile('after.jpg')] } as any });

    fireEvent.click(screen.getByText('שמור'));

    await waitFor(() => {
      expect(fromAPI.insert).toHaveBeenCalledTimes(1);
    });
  });

  it('retries once on permission error then succeeds', async () => {
    fromAPI.insert
      .mockResolvedValueOnce({ error: { code: '42501', message: 'permission denied' } })
      .mockResolvedValueOnce({ error: null });

    await openNewProjectForm();
    fireEvent.change(screen.getByLabelText('שם הפרויקט *'), { target: { value: 'Retry Project' } });
    fireEvent.change(screen.getByLabelText(/תמונה לפני/), { target: { files: [makeFile('b.jpg')] } as any });
    fireEvent.change(screen.getByLabelText(/תמונה אחרי/), { target: { files: [makeFile('a.jpg')] } as any });
    fireEvent.click(screen.getByText('שמור'));

    await waitFor(() => {
      expect(fromAPI.insert).toHaveBeenCalledTimes(2);
    });
  });

  it('surfaces non-permission errors with destructive toast', async () => {
    fromAPI.insert.mockResolvedValueOnce({ error: { code: '123', message: 'boom' } });

    await openNewProjectForm();
    fireEvent.change(screen.getByLabelText('שם הפרויקט *'), { target: { value: 'Err Project' } });
    fireEvent.change(screen.getByLabelText(/תמונה לפני/), { target: { files: [makeFile('b.jpg')] } as any });
    fireEvent.change(screen.getByLabelText(/תמונה אחרי/), { target: { files: [makeFile('a.jpg')] } as any });
    fireEvent.click(screen.getByText('שמור'));

    await waitFor(() => {
      expect(toastSpy).toHaveBeenCalled();
    });
  });
});


