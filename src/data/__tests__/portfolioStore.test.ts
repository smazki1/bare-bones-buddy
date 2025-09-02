import { describe, it, expect, beforeEach, vi } from 'vitest';
import { portfolioStore, PORTFOLIO_UPDATE_EVENT } from '@/data/portfolioStore';
import type { Project } from '@/data/portfolioMock';

// Helpers
function listenOnce(event: string) {
  return new Promise<void>((resolve) => {
    const handler = () => {
      window.removeEventListener(event, handler as EventListener);
      resolve();
    };
    window.addEventListener(event, handler as EventListener);
  });
}

describe('portfolioStore', () => {
  beforeEach(() => {
    // Reset localStorage and store to default config
    localStorage.clear();
    portfolioStore.reset();
  });

  it('returns projects sorted by default strategy (pinned -> newest -> id desc)', () => {
    const projects = portfolioStore.getProjects();
    expect(projects.length).toBeGreaterThan(0);

    // Add two projects to test ordering
    const a = portfolioStore.addProject({
      businessName: 'A', businessType: 'X', serviceType: 'תמונות', imageAfter: 'a', size: 'small', category: 'restaurants'
    });
    const b = portfolioStore.addProject({
      businessName: 'B', businessType: 'X', serviceType: 'תמונות', imageAfter: 'b', size: 'small', category: 'restaurants'
    });

    // Newer (b) should come before older (a) unless pinned
    const afterAdd = portfolioStore.getProjects();
    const idxA = afterAdd.findIndex(p => p.id === a.id);
    const idxB = afterAdd.findIndex(p => p.id === b.id);
    expect(idxB).toBeLessThan(idxA);

    // Pin older (a) -> should jump before b
    portfolioStore.togglePinned(a.id);
    const afterPin = portfolioStore.getProjects();
    const idxA2 = afterPin.findIndex(p => p.id === a.id);
    const idxB2 = afterPin.findIndex(p => p.id === b.id);
    expect(idxA2).toBeLessThan(idxB2);
  });

  it('applies manual order per category when provided', () => {
    const c1 = portfolioStore.addProject({
      businessName: 'C1', businessType: 'T', serviceType: 'תמונות', imageAfter: '1', size: 'small', category: 'bars'
    });
    const c2 = portfolioStore.addProject({
      businessName: 'C2', businessType: 'T', serviceType: 'תמונות', imageAfter: '2', size: 'small', category: 'bars'
    });
    const c3 = portfolioStore.addProject({
      businessName: 'C3', businessType: 'T', serviceType: 'תמונות', imageAfter: '3', size: 'small', category: 'bars'
    });

    // Manual order: c2, c3, c1
    portfolioStore.setManualOrderForCategory('bars', [Number(c2.id), Number(c3.id), Number(c1.id)]);
    const bars = portfolioStore.getProjectsByCategory('bars');
    const ids = bars.map(p => Number(p.id));
    expect(ids.slice(0, 3)).toEqual([Number(c2.id), Number(c3.id), Number(c1.id)]);
  });

  it('dispatches update event on changes', async () => {
    const wait = listenOnce(PORTFOLIO_UPDATE_EVENT);
    portfolioStore.addProject({
      businessName: 'Evt', businessType: 'E', serviceType: 'תמונות', imageAfter: 'x', size: 'small', category: 'restaurants'
    });
    await wait; // resolves if event dispatched
    expect(true).toBe(true);
  });

  it('updateProject preserves id and updates fields', () => {
    const p = portfolioStore.addProject({
      businessName: 'Upd', businessType: 'U', serviceType: 'תמונות', imageAfter: 'x', size: 'small', category: 'restaurants'
    });
    const ok = portfolioStore.updateProject(p.id, { businessName: 'Updated' });
    expect(ok).toBe(true);
    const again = portfolioStore.getProjects().find(x => x.id === p.id)!;
    expect(again.businessName).toBe('Updated');
    expect(again.id).toBe(p.id);
  });

  it('deleteProject removes item and returns true; false for missing', () => {
    const p = portfolioStore.addProject({
      businessName: 'Del', businessType: 'D', serviceType: 'תמונות', imageAfter: 'x', size: 'small', category: 'restaurants'
    });
    expect(portfolioStore.deleteProject(p.id)).toBe(true);
    expect(portfolioStore.deleteProject(99999)).toBe(false);
  });

  it('getProjectsByCategory filters and respects manual order', () => {
    const r1 = portfolioStore.addProject({ businessName: 'R1', businessType: 'R', serviceType: 'תמונות', imageAfter: '1', size: 'small', category: 'restaurants' });
    const r2 = portfolioStore.addProject({ businessName: 'R2', businessType: 'R', serviceType: 'תמונות', imageAfter: '2', size: 'small', category: 'restaurants' });
    portfolioStore.setManualOrderForCategory('restaurants', [Number(r2.id), Number(r1.id)]);
    const list = portfolioStore.getProjectsByCategory('restaurants');
    const ids = list.map(p => Number(p.id));
    expect(ids.slice(0, 2)).toEqual([Number(r2.id), Number(r1.id)]);
  });

  it('import/export roundtrip keeps manual order + items', () => {
    const x = portfolioStore.addProject({ businessName: 'X', businessType: 'X', serviceType: 'תמונות', imageAfter: 'x', size: 'small', category: 'bars' });
    const y = portfolioStore.addProject({ businessName: 'Y', businessType: 'Y', serviceType: 'תמונות', imageAfter: 'y', size: 'small', category: 'bars' });
    portfolioStore.setManualOrderForCategory('bars', [Number(y.id), Number(x.id)]);
    const cfg = portfolioStore.exportConfig();
    portfolioStore.importConfig(cfg);
    const bars = portfolioStore.getProjectsByCategory('bars');
    const ids = bars.map(p => Number(p.id));
    expect(ids.slice(0, 2)).toEqual([Number(y.id), Number(x.id)]);
  });
});


