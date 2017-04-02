import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AffixDirective } from './src/ng2-affix';

export * from './src/ng2-affix';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    AffixDirective,
  ],
  exports: [
    AffixDirective,
  ]
})
export class AffixModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: AffixModule
    };
  }
}
