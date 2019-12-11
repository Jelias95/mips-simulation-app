import { InstructionInputComponent } from './instruction-input/instruction-input.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


const routes: Routes = [
  { path: 'instruction-input', component: InstructionInputComponent },
  { path: '', redirectTo: '/instruction-input', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { enableTracing: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
