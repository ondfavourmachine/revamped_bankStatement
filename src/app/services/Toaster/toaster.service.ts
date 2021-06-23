import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class ToasterService {

  constructor(private toastr: ToastrService) { }

  public showWarningMessage(msg: string){
    this.toastr.warning(msg, '', {positionClass: 'toast-top-center'});
  }

  public showSuccessMsg(msg: string, position?: string){
      this.toastr.success(msg, '', {positionClass: position ? position : 'toast-top-right'})
  }

  public showErrorMsg(msg: string, position?: string){
    this.toastr.error(msg, '', {positionClass: position ? position : 'toast-top-right'});
  }
}
