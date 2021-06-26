import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { stringify } from "@angular/compiler/src/util";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { BehaviorSubject, throwError } from "rxjs";
import { catchError, map, tap } from  'rxjs/operators';
import { User } from "./user.model";
import { environment } from "src/environments/environment";

export interface AuthResponseData{
    idToken: string;	//A Firebase Auth ID token for the newly created user.
    email: string;	//The email for the newly created user.
    refreshToken: string;	//A Firebase Auth refresh token for the newly created user.
    expiresIn: string;	//The number of seconds in which the ID token expires.
    localId: string;	//The uid of the newly created user.
    registered?: boolean; //Whether the email is for an existing account.
}

@Injectable({ providedIn: 'root'})

export class AuthService {

    userSubject = new BehaviorSubject<User>(null);

    constructor(
        private http: HttpClient,
        private router: Router
    ){}

    signup(email: string, password: string){

        return this.http.post<AuthResponseData>('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' + environment.firebaseAPIKey, 
        { 
            email : email, 
            password: password,
            returnSecureToken: true
        }).pipe(catchError(this.handleError), tap(
            respData=> {
                this.HandleAuth(respData.email, respData.localId, respData.idToken, +respData.expiresIn);
        }));
        
    }//signup

    login(email: string, password: string) {
        return this.http.post<AuthResponseData>('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key='+ environment.firebaseAPIKey, 
        { 
            email : email, 
            password: password,
            returnSecureToken: true
        }).pipe( catchError(this.handleError), tap( 
            respData =>{ 
                this.HandleAuth(respData.email, respData.localId, respData.idToken, +respData.expiresIn);
            })
        );
    }

    logout(){
        this.userSubject.next(null);
        localStorage.removeItem('userData');
        this.router.navigate(['/auth']);
    }

    autoLogin(){
        const user : {
            email : string, 
            id: string,
            _token: string,
            _tokenExpirationDate: string
        }= JSON.parse(localStorage.getItem('userData'));

        if(!user){
            return;
        }
        
        const currentUser = new User(user.email, user.id, user._token, new Date(user._tokenExpirationDate));
        
        if(currentUser.Token){
            this.userSubject.next(currentUser);
        }
    }

    private handleError (errorResp: HttpErrorResponse){
        let errorMsg = 'Oops! Something went wrong!';
            
        if(errorResp.error || errorResp.error.error){
            switch(errorResp.error.error.message){
                case 'INVALID_PASSWORD':
                    errorMsg += "<br>Invalid password!";
                    break;
                case 'EMAIL_NOT_FOUND':
                    errorMsg += "<br>Email address not found!";
                    break;
                case 'USER_DISABLED':
                    errorMsg += "<br>User account has been disabled by the administrator.";
                    break;
                default:
                    errorMsg += "<br>" +errorResp.error.error.message;
                    break;
            }
        }
        
        return throwError(errorMsg);
    }

    private HandleAuth( email: string, id: string, token: string, tokenExpirationDate: number){
        
        const expDate= new Date(new Date().getTime() + (tokenExpirationDate * 1000));
        
        const user = new User(email, id, token, expDate);

        localStorage.setItem('userData', JSON.stringify(user));
        this.userSubject.next(user);
    }

}