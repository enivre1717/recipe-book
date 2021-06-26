import { Component, ComponentFactoryResolver, OnDestroy, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { AuthService } from './auth.service';
import { AuthResponseData } from '../auth/auth.service'
import { ActivatedRoute, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AlertComponent } from '../shared/alert/alert.component';
import { PlaceholderDirective } from '../shared/placeholder/placeholder.directive';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html'
})

export class AuthComponent implements OnDestroy{

  @ViewChild('f') authForm : NgForm;
  @ViewChild(PlaceholderDirective) alertHost : PlaceholderDirective;

  isLoginMode = false;
  authSubscription: Subscription;
  alertSubscription: Subscription;
  isLoading = false;
  error: string = null;

  constructor(
    private authService : AuthService,
    private router : Router,
    private compFactoryResolver: ComponentFactoryResolver
  ){

  }
 
  
  onSwitchMode(){

    this.isLoginMode = !this.isLoginMode;
  }

  onFormSubmit(){

    if(this.authForm.valid){
      this.isLoading = true;

      const email = this.authForm.value.email;
      const password = this.authForm.value.password;

      let authObs: Observable<AuthResponseData>;

      if(!this.isLoginMode){
        authObs = this.authService.signup(email, password);
      }else{
        authObs = this.authService.login(email, password);
      }

      authObs.subscribe(
        respData => {
          
          this.isLoading = false;
          this.error = null;
          this.router.navigate(['/recipes']);
        }, errorMessage => {
          //this.error = errorMessage;
          this.showErrorAlert(errorMessage);
          this.isLoading = false;
        }
      );

      this.authForm.reset();

    }else{
      return;
    }
      
  }// onFormSubmit

  closeModal(){
    this.error = null;
  }

  private showErrorAlert(errMsg : string){
    const alertCompFactory = this.compFactoryResolver.resolveComponentFactory(AlertComponent);
    const hostViewContainerRef = this.alertHost.viewContainRef;

    hostViewContainerRef.clear();
    const componentRef = hostViewContainerRef.createComponent(alertCompFactory);

    componentRef.instance.message = errMsg;
    console.log(errMsg);
    this.alertSubscription = componentRef.instance.close.subscribe( () => {
      this.alertSubscription.unsubscribe();
      hostViewContainerRef.clear();
    });
  }

  ngOnDestroy(){
    if(this.alertSubscription){
      this.alertSubscription.unsubscribe();
    }
  }
}
