import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JsonViewerComponent } from './json-viewer.component';

describe('JsonViewerComponent', () => {
  let component: JsonViewerComponent;
  let fixture: ComponentFixture<JsonViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JsonViewerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(JsonViewerComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should show placeholder when jsonData is null', () => {
    component.jsonData = null;
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('No JSON data available');
  });

  it('should show placeholder when jsonData is undefined', () => {
    component.jsonData = undefined;
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('No JSON data available');
  });

  it('should render formatted JSON for an object', () => {
    component.jsonData = { foo: 'bar' };
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('pre')).toBeTruthy();
    expect(el.textContent).toContain('"foo"');
    expect(el.textContent).toContain('"bar"');
  });

  it('should render JSON for an empty object without placeholder', () => {
    component.jsonData = {};
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).not.toContain('No JSON data available');
  });

  it('should apply syntax highlighting classes', () => {
    component.jsonData = { key: 'value', num: 42, flag: true };
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.json-key')).toBeTruthy();
    expect(el.querySelector('.json-string')).toBeTruthy();
    expect(el.querySelector('.json-number')).toBeTruthy();
    expect(el.querySelector('.json-boolean')).toBeTruthy();
  });
});
