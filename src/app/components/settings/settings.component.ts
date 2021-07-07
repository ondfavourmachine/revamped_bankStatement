import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TimeoutError } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { GeneralService } from 'src/app/services/general.service';
import { ToasterService } from 'src/app/services/Toaster/toaster.service';
import { UserService } from 'src/app/services/User/user.service';

interface ProfileUpdate {
  fullname?: string;
  phone?: string;
  company?: string;
}

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  passwordForm: FormGroup;
  fullNameForm: FormGroup;
  constructor(private fb: FormBuilder,
    private generalservice : GeneralService,
    private userservice: UserService,
    private toaster: ToasterService) { }

  ngOnInit(): void {

    this.passwordForm = this.fb.group({
      old_password: ['', Validators.required],
      new_password: ['', Validators.required]
    })

    this.fullNameForm = this.fb.group({
      fullname: ['', Validators.required]
    })
  }

  


  submitPassword(form: FormGroup, event: Event){
      const btn = (event.target as HTMLFormElement).querySelector('button');
      const obj = {...form.value};
      this.generalservice.loading4button(btn, "yes", "Updating...");
      this.handlePasswordUpdate(obj, btn, form)
  }

  submitFullName(form: FormGroup, event: Event){
    const btn = (event.target as HTMLFormElement).querySelector('button');
    const obj: ProfileUpdate  = {...form.value};
    this.generalservice.loading4button(btn, "yes", "Updating...");
    this.handleProfileUpdate(obj, btn, form)
  }

  
  async handlePasswordUpdate(
    obj: Object,
    btn: HTMLButtonElement,
    form: FormGroup
  ) {
     this.userservice.updatePassword(obj)
      .pipe(timeout(15000))
      .subscribe(
        val => {
          this.toaster.showSuccessMsg('Password Updated Successfully !')
          this.generalservice.loading4button(btn, "done", "Submit");
          form.reset();
        },
        err => {
          if (err instanceof TimeoutError) {
            this.toaster.showSuccessMsg('Sorry the request timed out, Please try again.')
            this.generalservice.loading4button(btn, "done", "Submit");
            form.reset();
          } else {
            this.toaster.showErrorMsg(err.error.failed || err.error.error)
            this.generalservice.loading4button(btn, "done", "Submit");
            form.reset();
          }
        }
      );
  }



  async handleProfileUpdate(
    val: ProfileUpdate,
    btn: HTMLButtonElement,
    form: FormGroup
  ) {
    this.userservice
      .updateAllOrAnyProfileField(val)
      .pipe(timeout(15000))
      .subscribe(
        val => {
          this.toaster.showSuccessMsg('Full Name changed successfully.')
          this.generalservice.loading4button(btn, "yes", "Change full Name");
          form.reset();
        },
        err => {
          if (err instanceof TimeoutError) {
           this.toaster.showErrorMsg(`Sorry we couldn't update at this time. Please try again later`)
            this.generalservice.loading4button(btn, "done", "Change full name");
            form.reset();
           
          } else {
            this.toaster.showErrorMsg(err.error.failed || err.error.error);
            this.generalservice.loading4button(btn, "done", "Change full name");
            form.reset();
          }
        }
      );
  }
}



