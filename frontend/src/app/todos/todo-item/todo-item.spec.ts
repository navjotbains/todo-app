import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TodoItem } from './todo-item';
import { Todo } from '../todo.model';

const milk: Todo = { id: '1', title: 'Buy milk', isCompleted: false, createdAt: '2026-10-08T09:00:00Z' };

describe('TodoItem', () => {
  let fixture: ComponentFixture<TodoItem>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TodoItem] }).compileComponents();
    fixture = TestBed.createComponent(TodoItem);
    element = fixture.nativeElement;
    fixture.componentRef.setInput('todo', milk);
    await fixture.whenStable();
  });

  it('shows the title', () => {
    expect(element.querySelector('.title')!.textContent).toContain('Buy milk');
  });

  it('asks to complete the todo when the checkbox is clicked', () => {
    let toggled: boolean | undefined;
    fixture.componentInstance.toggle.subscribe(value => (toggled = value));

    element.querySelector<HTMLInputElement>('input[type="checkbox"]')!.click();

    expect(toggled).toBe(true);
  });

  it('asks to delete the todo when the bin is clicked', () => {
    let removed: string | undefined;
    fixture.componentInstance.remove.subscribe(id => (removed = id));

    element.querySelector<HTMLButtonElement>('.delete')!.click();

    expect(removed).toBe('1');
  });

  it('strikes through completed todos', async () => {
    fixture.componentRef.setInput('todo', { ...milk, isCompleted: true });
    await fixture.whenStable();

    expect(element.querySelector('.title')!.classList).toContain('done');
  });
});