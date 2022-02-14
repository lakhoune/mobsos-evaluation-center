import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OidcSigninComponent } from './oidc/oidc-signin/oidc-signin.component';
import { OidcSignoutComponent } from './oidc/oidc-signout/oidc-signout.component';
import { OidcSilentComponent } from './oidc/oidc-silent/oidc-silent.component';
import { JoinWorkSpaceComponent } from './join-work-space/join-work-space.component';
import { PreloadingStrategyService } from './preloading-strategy.service';

const routes: Routes = [
  { path: '', redirectTo: '/success-modeling', pathMatch: 'full' },
  {
    path: 'success-modeling/oidc-silent',
    redirectTo: 'oidc-silent', // for some reason, success-modeling/oidc-silent is called it might be that the statusbar just appends to the current route
  },
  {
    path: 'success-modeling/oidc-signin',
    redirectTo: 'oidc-signin', // for some reason, success-modeling/oidc-silent is called it might be that the statusbar just appends to the current route
  },
  {
    path: 'success-modeling/oidc-signout',
    redirectTo: 'oidc-signout', // for some reason, success-modeling/oidc-silent is called it might be that the statusbar just appends to the current route
  },
  {
    path: 'success-modeling',
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./success-modeling/success-modeling.module').then(
            (m) => m.SuccessModelingModule,
          ),
        data: { preload: true },
      },
      {
        path: 'raw-edit',
        loadChildren: () =>
          import('./raw-edit/raw-edit.module').then(
            (m) => m.RawEditModule,
          ),
      },
    ],
  },
  { path: 'oidc-signin', component: OidcSigninComponent },
  { path: 'oidc-signout', component: OidcSignoutComponent },
  { path: 'oidc-silent', component: OidcSilentComponent },
  {
    path: 'join/:groupId/:serviceName/:username',
    component: JoinWorkSpaceComponent,
  },
  {
    path: 'query-visualization',
    loadChildren: () =>
      import('./query-visualization/query-visualization.module').then(
        (m) => m.QueryVisualizationModule,
      ),
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: PreloadingStrategyService,
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
