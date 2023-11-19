import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';


@Component({
  selector: 'grush-cavern-seer',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './cavern-seer.component.html',
  styleUrl: './cavern-seer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CavernSeerComponent {

}

export default CavernSeerComponent;
