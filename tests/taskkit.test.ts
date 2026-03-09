import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { TaskStore } from '../src/store';

const tempDirs: string[] = [];

async function createStore(): Promise<{ store: TaskStore; path: string }> {
  const dir = await mkdtemp(join(tmpdir(), 'taskkit-'));
  tempDirs.push(dir);
  const path = join(dir, 'tasks.json');
  return { store: new TaskStore(path), path };
}

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

describe('TaskStore', () => {
  it('adds and lists tasks', async () => {
    const { store } = await createStore();

    await store.add({
      title: 'Write tests',
      description: 'Cover add/list flow',
      priority: 'high',
      tags: ['test', 'cli'],
    });

    const tasks = await store.list();
    expect(tasks).toHaveLength(1);
    expect(tasks[0]).toMatchObject({
      title: 'Write tests',
      status: 'todo',
      priority: 'high',
      tags: ['test', 'cli'],
    });
  });

  it('filters tasks by status, priority, and tag', async () => {
    const { store } = await createStore();
    const first = await store.add({ title: 'Urgent bug', priority: 'urgent', tags: ['bug'] });
    await store.add({ title: 'Docs', priority: 'low', tags: ['docs'] });
    await store.markDone(first.id);

    const filtered = await store.list({ status: 'done', priority: 'urgent', tag: 'bug' });
    expect(filtered).toHaveLength(1);
    expect(filtered[0].title).toBe('Urgent bug');
  });

  it('marks tasks done and removes tasks', async () => {
    const { store, path } = await createStore();
    const task = await store.add({ title: 'Ship release' });

    const done = await store.markDone(task.id);
    expect(done.status).toBe('done');

    const removed = await store.remove(task.id);
    expect(removed.id).toBe(task.id);
    expect(await store.list()).toHaveLength(0);

    const fileContent = await readFile(path, 'utf8');
    expect(fileContent.trim()).toBe('[]');
  });
});
