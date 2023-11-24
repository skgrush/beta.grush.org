import { Component, DestroyRef, HostBinding, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { IRouteTreeNode, SidebarService } from './sidebar.service';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatIconModule } from '@angular/material/icon';
import { MatTreeNestedDataSource, MatTreeModule } from '@angular/material/tree';
import { MatButtonModule } from '@angular/material/button';
import { tap } from 'rxjs';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'nav[grush-sidebar]',
  standalone: true,
  imports: [CommonModule, MatTreeModule, MatIconModule, RouterLink, RouterLinkActive, MatButtonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  providers: [SidebarService],
})
export class SidebarComponent implements OnInit {

  readonly #destroyRef = inject(DestroyRef);
  readonly #service = inject(SidebarService);

  readonly treeControl = new NestedTreeControl<IRouteTreeNode>(node => node.children);
  readonly dataSource = new MatTreeNestedDataSource<IRouteTreeNode>();

  readonly hasChild = (_: number, node: IRouteTreeNode) => !!node.children;

  ngOnInit(): void {
    this.#service.routes$.pipe(
      takeUntilDestroyed(this.#destroyRef),
      tap(data => {
        this.treeControl.dataNodes = this.dataSource.data = data ?? [];
        this.treeControl.expandAll();
      }),
    ).subscribe();
  }
}
