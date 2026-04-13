import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-icon',
  template: `
    <svg class="w-full h-full" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="12" fill="currentColor" />
      <path
        d="M12 4.2C9.8 6 7 6.7 5.8 7V11.2C5.8 14.5 8.3 17.2 12 18.8C15.7 17.2 18.2 14.5 18.2 11.2V7C17 6.7 14.2 6 12 4.2Z"
        fill="white"
      />
      <path d="M9.2 12.5L11 14.2L14.6 10.6L13.8 9.8L11 12.6L9.9 11.5Z" fill="currentColor" />
    </svg>
  `,
  host: {
    class: 'inline-block',
  },
})
export class AppIcon {}
