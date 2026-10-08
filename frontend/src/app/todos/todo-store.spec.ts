import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TodoStore } from './todo-store';
import { Todo } from './todo.model';

const milk: Todo = { id: '1', title: 'Buy milk', isCompleted: false, createdAt: '2026-10-08T09:00:00Z' };
const bread: Todo = { id: '2', title: 'Buy bread', isCompleted: true, createdAt: '2026-10-08T09:01:00Z' };

describe('TodoStore', () => {
  let store: TodoStore;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    store = TestBed.inject(TodoStore);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  async function seed(todos: Todo[]): Promise<void> {
    const loading = store.load();
    http.expectOne('/api/todos').flush(todos);
    await loading;
  }

  it('loads todos from the API', async () => {
    const loading = store.load();
    expect(store.loading()).toBe(true);

    http.expectOne('/api/todos').flush([milk, bread]);
    await loading;

    expect(store.todos()).toEqual([milk, bread]);
    expect(store.loading()).toBe(false);
    expect(store.completedCount()).toBe(1);
  });

  it('shows an error when loading fails', async () => {
    const loading = store.load();
    http.expectOne('/api/todos').flush('Server error', { status: 500, statusText: 'Server Error' });
    await loading;

    expect(store.error()).toBe('Could not load your todos. Please try again.');
    expect(store.loading()).toBe(false);
  });

  it('adds the todo returned by the API', async () => {
    const adding = store.add('Buy milk');
    const request = http.expectOne('/api/todos');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ title: 'Buy milk' });

    request.flush(milk);
    await adding;

    expect(store.todos()).toEqual([milk]);
  });

  it('removes a todo after the API deletes it', async () => {
    await seed([milk, bread]);

    const removing = store.remove('1');
    http.expectOne({ method: 'DELETE', url: '/api/todos/1' }).flush(null);
    await removing;

    expect(store.todos()).toEqual([bread]);
  });

  it('ticks a todo straight away and keeps it when the API succeeds', async () => {
    await seed([milk]);

    const updating = store.setCompleted('1', true);
    expect(store.todos()[0].isCompleted).toBe(true);

    http.expectOne({ method: 'PATCH', url: '/api/todos/1' }).flush({ ...milk, isCompleted: true });
    await updating;

    expect(store.todos()[0].isCompleted).toBe(true);
  });

  it('rolls back and shows an error when completing fails', async () => {
    await seed([milk]);

    const updating = store.setCompleted('1', true);
    http.expectOne('/api/todos/1').flush('Server error', { status: 500, statusText: 'Server Error' });
    await updating;

    expect(store.todos()[0].isCompleted).toBe(false);
    expect(store.error()).toBe('Could not update the todo. Please try again.');
  });
});