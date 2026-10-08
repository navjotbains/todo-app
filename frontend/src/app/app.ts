import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ThemeStore } from './core/theme-store';
import { TodoFilter } from './todos/todo.model';
import { TodoStore } from './todos/todo-store';
import { TodoForm } from './todos/todo-form/todo-form';
import { TodoItem } from './todos/todo-item/todo-item';

@Component({
  selector: 'app-root',
  imports: [DatePipe, TodoForm, TodoItem],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  protected readonly store = inject(TodoStore);
  protected readonly theme = inject(ThemeStore);
  protected readonly today = new Date();
  protected readonly skeletonRows = [1, 2, 3];

  protected readonly filter = signal<TodoFilter>('all');
  protected readonly filters: { value: TodoFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'done', label: 'Done' },
  ];

  protected readonly counts = computed<Record<TodoFilter, number>>(() => ({
    all: this.store.count(),
    active: this.store.count() - this.store.completedCount(),
    done: this.store.completedCount(),
  }));

  protected readonly visibleTodos = computed(() => {
    const todos = this.store.todos();
    switch (this.filter()) {
      case 'active':
        return todos.filter(todo => !todo.isCompleted);
      case 'done':
        return todos.filter(todo => todo.isCompleted);
      default:
        return todos;
    }
  });

  protected readonly progress = computed(() => {
    const total = this.store.count();
    return total === 0 ? 0 : Math.round((this.store.completedCount() / total) * 100);
  });

  ngOnInit(): void {
    this.store.load();
  }
}