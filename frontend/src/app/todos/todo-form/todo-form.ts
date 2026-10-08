import { Component, output, signal } from '@angular/core';

@Component({
  selector: 'app-todo-form',
  templateUrl: './todo-form.html',
  styleUrl: './todo-form.scss',
})
export class TodoForm {
  readonly add = output<string>();
  protected readonly title = signal('');

  protected onInput(event: Event): void {
    this.title.set((event.target as HTMLInputElement).value);
  }

  protected submit(event: Event): void {
    event.preventDefault();
    const title = this.title().trim();
    if (!title) {
      return;
    }
    this.add.emit(title);
    this.title.set('');
  }
}