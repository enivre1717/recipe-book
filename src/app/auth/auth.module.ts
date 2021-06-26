import { NgModule } from "@angular/core";
import { AuthComponent } from './auth.component';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptorsService } from './auth-interceptors.service';
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { SharedModule } from "../shared/shared.modules";
import { RouterModule } from "@angular/router";
import { AlertComponent } from "../shared/alert/alert.component";

@NgModule({
    imports:[
        CommonModule,
        FormsModule,
        SharedModule,
        RouterModule.forChild([
            { path: '', component: AuthComponent }
        ])
    ],
    declarations:[
        AuthComponent,
    ],
    providers:[
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptorsService,
            multi: true
        }
    ],
    exports:[
        AuthComponent
    ],
    entryComponents: [
        AlertComponent
    ]
})

export class AuthModule{

}