import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatDrawerMode, MatSidenavModule } from '@angular/material/sidenav';
import { SidebarComponent } from "./shared/components/sidebar/sidebar.component";
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { LayoutService, LayoutWidth } from './shared/services/layout.service';

@Component({
  selector: 'grush-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [CommonModule, RouterOutlet, MatSidenavModule, MatButtonModule, MatIconModule, SidebarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  readonly #layout = inject(LayoutService);

  readonly mode$ = this.#layout.screenWidth$;

  #wideOpened = true;
  #narrowOpened = false;

  getSidenavMode(mode: LayoutWidth): MatDrawerMode {
    return mode === LayoutWidth.Wide ? 'side' : 'over';
  }

  getOpened(mode: LayoutWidth) {
    if (mode === LayoutWidth.Wide) {
      return this.#wideOpened;
    } else {
      return this.#narrowOpened;
    }
  }

  toggleClick(mode: LayoutWidth) {
    if (mode === LayoutWidth.Wide) {
      this.#wideOpened = !this.#wideOpened;
    } else {
      this.#narrowOpened = !this.#narrowOpened;
    }
  }

  openChanged(mode: LayoutWidth, open: boolean) {
    if (mode === LayoutWidth.Wide) {
      this.#wideOpened = open;
    } else {
      this.#narrowOpened = open;
    }
  }
}
