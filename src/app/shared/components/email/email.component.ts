import { ChangeDetectionStrategy, Component, HostBinding, Input, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'grush-email',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './email.component.html',
  styles: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class EmailComponent {

  @Input({ required: true })
  user!: string;
  @Input({ required: true })
  domain!: readonly string[];

  @HostBinding('style.display')
  readonly styleDisplay = 'flex';

  get parts() {
    return this.#generateEmailParts(this.user, ...this.domain);
  }

  *#generateEmailParts(user: string, ...domainParts: string[]) {
    const email = [
      user,
      domainParts.join('.'),
    ].join('@');

    const parts = email.split('').map((ele, idx) => [idx, ele] as const);

    while (parts.length) {
      const randomIdx = Math.floor(Math.random() * parts.length);
      const [part] = parts.splice(randomIdx, 1);
      yield part;
    }
  }
}
