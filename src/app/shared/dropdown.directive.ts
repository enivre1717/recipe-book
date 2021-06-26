import { Directive, HostListener, HostBinding, ElementRef } from '@angular/core';

@Directive({
  selector: '[appDropdown]'
})
export class DropdownDirective {

  constructor(private elRef:ElementRef) {}

  @HostBinding('class.show') isOpen = false;

  @HostListener('click') toggleOpen() {
    this.isOpen = !this.isOpen;

    if(this.isOpen){
      var div = this.elRef.nativeElement.querySelector('ul');
      
      if(div){
        div.classList.add('show');
      }
    }else{
      var div = this.elRef.nativeElement.querySelector('ul');

      if(div){
        div.classList.remove('show');
      }
    }
  }
  
}
