import { Component, computed, output, signal } from '@angular/core';

@Component({
  selector: 'app-todo-form',
  templateUrl: './todo-form.html',
  styleUrl: './todo-form.scss',
})
export class TodoForm {
  readonly add = output<string>();

  protected readonly maxLength = 200;
  protected readonly counterFrom = 150;
  protected readonly title = signal('');
  protected readonly length = computed(() => this.title().length);

  protected onInput(event: Event): void {
    const value = (event.target as HTMLTextAreaElement).value;
    this.title.set(value.replace(/\s*\n\s*/g, ' '));
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