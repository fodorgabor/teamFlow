import { Routes } from '@angular/router';
import { Projektek } from './projektek/projektek';
import { Torzsadatok } from './torzsadatok/torzsadatok';
import { Feladatok } from './feladatok/feladatok';
import { Csapat } from './csapat/csapat';
import { Attekintes } from './attekintes/attekintes';

export const routes: Routes = [
    {path: '', component: Attekintes},
    {path: 'csapat', component: Csapat},
    {path: 'feladatok', component: Feladatok},
    {path: 'projektek', component: Projektek},
    {path: 'torzsadatok', component: Torzsadatok},
];
