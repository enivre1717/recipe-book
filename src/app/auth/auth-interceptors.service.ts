import { HttpHandler, HttpInterceptor, HttpParams, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AuthService } from "./auth.service";
import { take, exhaustMap} from 'rxjs/operators';

@Injectable()

export class AuthInterceptorsService implements HttpInterceptor{

    constructor(private authService: AuthService){}

    intercept(req: HttpRequest<any>, next: HttpHandler){
        return this.authService.userSubject.pipe(
            take(1), 
            exhaustMap( user =>{
                if(user){
                    const modReq = req.clone({ params: new HttpParams().set('auth', user.Token) });
                    return next.handle(modReq);
                }else{
                    return next.handle(req);
                }
            })
        );
    }
}