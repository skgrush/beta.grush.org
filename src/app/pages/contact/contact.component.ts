import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmailComponent } from '../../shared/components/email/email.component';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'grush-contact',
  standalone: true,
  imports: [CommonModule, EmailComponent, MatCardModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContactComponent { }

export default ContactComponent;
