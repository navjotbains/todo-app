import { Component, OnInit, inject } from '@angular/core';
import { TodoStore } from './todos/todo-store';
import { TodoForm } from './todos/todo-form/todo-form';
import { TodoItem } from './todos/todo-item/todo-item';

@Component({
  selector: 'app-root',
  imports: [TodoForm, TodoItem],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  protected readonly store = inject(TodoStore);

  ngOnInit(): void {
    this.store.load();
  }
}