import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-json-viewer',
  standalone: true,
  imports: [],
  templateUrl: './json-viewer.component.html',
  styleUrl: './json-viewer.component.css',
})
export class JsonViewerComponent {
  @Input() jsonData: any;

  get hasData(): boolean {
    return this.jsonData != null;
  }

  get highlightedJson(): string {
    if (this.jsonData == null) {
      return '';
    }

    let raw: string;
    if (typeof this.jsonData === 'string') {
      try {
        raw = JSON.stringify(JSON.parse(this.jsonData), null, 2);
      } catch {
        raw = this.jsonData;
      }
    } else {
      raw = JSON.stringify(this.jsonData, null, 2);
    }

    return raw.replace(
      /("(\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      (match) => {
        let cls = 'json-number';
        if (/^"/.test(match)) {
          cls = /:$/.test(match) ? 'json-key' : 'json-string';
        } else if (/true|false/.test(match)) {
          cls = 'json-boolean';
        } else if (/null/.test(match)) {
          cls = 'json-null';
        }
        const escaped = match
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
        return `<span class="${cls}">${escaped}</span>`;
      }
    );
  }
}
