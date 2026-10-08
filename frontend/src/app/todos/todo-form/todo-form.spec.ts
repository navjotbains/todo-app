import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TodoForm } from './todo-form';

describe('TodoForm', () => {
  let fixture: ComponentFixture<TodoForm>;
  let element: HTMLElement;
  let added: string[];

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TodoForm] }).compileComponents();
    fixture = TestBed.createComponent(TodoForm);
    element = fixture.nativeElement;
    added = [];
    fixture.componentInstance.add.subscribe(title => added.push(title));
    await fixture.whenStable();
  });

  async function type(text: string): Promise<void> {
    const textarea = element.querySelector('textarea')!;
    textarea.value = text;
    textarea.dispatchEvent(new Event('input'));
    await fixture.whenStable();
  }

  async function submit(): Promise<void> {
    element.querySelector('form')!.dispatchEvent(new Event('submit'));
    await fixture.whenStable();
  }

  it('disables Add when the title is empty', () => {
    expect(element.querySelector('button')!.disabled).toBe(true);
  });

  it('emits the trimmed title and clears the box', async () => {
    await type('  Buy milk  ');
    await submit();

    expect(added).toEqual(['Buy milk']);
    expect(element.querySelector('textarea')!.value).toBe('');
  });

  it('adds the todo when Enter is pressed', async () => {
    await type('Buy milk');
    element.querySelector('textarea')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    await fixture.whenStable();

    expect(added).toEqual(['Buy milk']);
  });

  it('turns pasted line breaks into spaces', async () => {
    await type('Buy\nmilk');
    await submit();

    expect(added).toEqual(['Buy milk']);
  });

  it('shows the character counter near the limit', async () => {
    expect(element.querySelector('.counter')).toBeNull();

    await type('a'.repeat(150));

    expect(element.querySelector('.counter')!.textContent).toContain('150 / 200');
  });
});