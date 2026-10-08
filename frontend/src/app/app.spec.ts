import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { App } from './app';
import { Todo } from './todos/todo.model';

const milk: Todo = { id: '1', title: 'Buy milk', isCompleted: false, createdAt: '2026-10-08T09:00:00Z' };
const bread: Todo = { id: '2', title: 'Buy bread', isCompleted: true, createdAt: '2026-10-08T09:01:00Z' };

function waitForAsyncWork(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve));
}

describe('App', () => {
  let fixture: ComponentFixture<App>;
  let element: HTMLElement;

  async function render(todos: Todo[]): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(App);
    element = fixture.nativeElement;
    fixture.detectChanges();

    TestBed.inject(HttpTestingController).expectOne('/api/todos').flush(todos);
    await waitForAsyncWork();
    await fixture.whenStable();
  }

  function titles(): string[] {
    return Array.from(element.querySelectorAll('.title')).map(title => title.textContent!.trim());
  }

  it('shows the empty state when there are no todos', async () => {
    await render([]);

    expect(element.textContent).toContain('All clear');
  });

  it('shows how many todos are done', async () => {
    await render([milk, bread]);

    expect(element.querySelector('.summary')!.textContent).toContain('1 of 2 done');
  });

  it('shows only completed todos on the Done tab', async () => {
    await render([milk, bread]);

    element.querySelectorAll<HTMLButtonElement>('.filter')[2].click();
    await fixture.whenStable();

    expect(titles()).toEqual(['Buy bread']);
  });
});