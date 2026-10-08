import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
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
}