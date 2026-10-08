import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Todo } from './todo.model';

@Injectable({ providedIn: 'root' })
export class TodoStore {
  private readonly http = inject(HttpClient);
  private readonly url = '/api/todos';

  private readonly _todos = signal<Todo[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly todos = this._todos.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly count = computed(() => this._todos().length);
  readonly completedCount = computed(() => this._todos().filter(todo => todo.isCompleted).length);

  async load(): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      this._todos.set(await firstValueFrom(this.http.get<Todo[]>(this.url)));
    } catch {
      this._error.set('Could not load your todos. Please try again.');
    } finally {
      this._loading.set(false);
    }
  }

  async add(title: string): Promise<void> {
    this._error.set(null);
    try {
      const todo = await firstValueFrom(this.http.post<Todo>(this.url, { title }));
      this._todos.update(todos => [...todos, todo]);
    } catch {
      this._error.set('Could not add the todo. Please try again.');
    }
  }

  async remove(id: string): Promise<void> {
    this._error.set(null);
    try {
      await firstValueFrom(this.http.delete<void>(`${this.url}/${id}`));
      this._todos.update(todos => todos.filter(todo => todo.id !== id));
    } catch {
      this._error.set('Could not delete the todo. Please try again.');
    }
  }

  async setCompleted(id: string, isCompleted: boolean): Promise<void> {
    this._error.set(null);
    this.replace(id, todo => ({ ...todo, isCompleted }));
    try {
        const updated = await firstValueFrom(this.http.patch<Todo>(`${this.url}/${id}`, { isCompleted }));
        this.replace(id, () => updated);
    } catch {
        this.replace(id, todo => ({ ...todo, isCompleted: !isCompleted }));
        this._error.set('Could not update the todo. Please try again.');
    }
  }

  private replace(id: string, change: (todo: Todo) => Todo): void {
    this._todos.update(todos => todos.map(todo => (todo.id === id ? change(todo) : todo)));
  }
}