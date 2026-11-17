import { Routes } from '@angular/router';
import { Projektek } from './projektek/projektek';
import { Torzsadatok } from './torzsadatok/torzsadatok';
import { Feladatok } from './feladatok/feladatok';
import { Csapat } from './csapat/csapat';
import { Attekintes } from './attekintes/attekintes';
import { UjFeladat } from './uj-feladat/uj-feladat';
import { FeladatReszletezo } from './feladat-reszletezo/feladat-reszletezo';

export const routes: Routes = [
  { path: '', component: Attekintes },
  { path: 'csapat', component: Csapat },
  { path: 'feladatok', component: Feladatok },
  { path: 'feladatok/new', component: UjFeladat },
  { path: 'feladatok/:id', component: FeladatReszletezo },
  { path: 'projektek', component: Projektek },
  { path: 'torzsadatok', component: Torzsadatok },
];