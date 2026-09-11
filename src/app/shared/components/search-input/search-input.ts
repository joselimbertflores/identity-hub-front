import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  output,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs';
import { NgIcon } from '@ng-icons/core';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputGroupImports } from '@spartan-ng/helm/input-group';

@Component({
  selector: 'search-input',
  imports: [ReactiveFormsModule, NgIcon, HlmFieldImports, HlmInputGroupImports],
  template: `
    <div hlmField>
      <label hlmFieldLabel for="search">{{ label() }}</label>
      <div hlmInputGroup>
        <span hlmInputGroupAddon><ng-icon name="lucideSearch" /></span>
        <input id="search" hlmInputGroupInput type="search" [formControl]="searchControl" />
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchInput {
  private readonly destroyRef = inject(DestroyRef);

  readonly label = input<string>('Buscar');
  readonly searchControl = new FormControl('');
  readonly search = output<string>();

  ngOnInit(): void {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(450),
        takeUntilDestroyed(this.destroyRef),
        distinctUntilChanged(),
        filter((term) => term !== null),
      )
      .subscribe((term) => {
        this.search.emit(term);
      });
  }
}
