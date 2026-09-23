import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AboutPageComponent } from './components/about-page/about-page.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'about', component: AboutPageComponent },
];
