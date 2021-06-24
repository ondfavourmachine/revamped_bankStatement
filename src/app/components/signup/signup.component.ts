import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { retry, timeout } from 'rxjs/operators';
import { Alert, AlertObject } from 'src/app/models/Alert';
import { RegistrationForm } from 'src/app/models/registrationForm';
import { AuthService } from 'src/app/services/auth.service';
import { GeneralService } from 'src/app/services/general.service';
import { ToasterService } from 'src/app/services/Toaster/toaster.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {

  registrationForm: FormGroup;
  private transaction_id: string;
  public alertContainer: AlertObject = { instance: null };
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authservice: AuthService,
    private generalservice: GeneralService,
    private toaster: ToasterService,
    private activatedRoute: ActivatedRoute
  ) {
    activatedRoute.queryParams.subscribe(val => {
      this.transaction_id = val["transaction_id"]
        ? val["transaction_id"]
        : null;
    });
    // console.log(this.transaction_id);
  }

  ngOnInit() {
    setTimeout(() => {  
      ( document.getElementById('preloader') as HTMLDivElement).style.visibility = 'hidden';
     }, 300);
    this.registrationForm = this.fb.group(this.generateRegistrationForm());
  }

  private generateRegistrationForm() {
    return {
      fullname: ["", [Validators.required]],
      phone: ["", [Validators.required]],
      company: [""],
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required, Validators.minLength(6)]],
      confirmpassword: ["", [Validators.required]],
      transaction_id: [""]
    };
  }

  // this function will enable the registration of users!
  public registerUser(form: FormGroup) {
    let formToSubmit: RegistrationForm = {};
    console.log(form.value.length);
    if (form.value.phone.toString().length < 10) {
      // this.alertContainer["instance"] = new Alert(
      //   "alert-soft-danger fade show",
      //   "fa fa-minus-circle alert-icon mr-3",
      //   "Please provide a valid Nigerian number"
      // );

      this.toaster.showErrorMsg("Please provide a valid Nigerian number");
    } else {
      const btn = document.getElementById("submitButton") as HTMLButtonElement;
      this.generalservice.loading4button(btn, "yes", "Registering...");
      // sessionStorage.setItem("registeredUser", JSON.stringify(form.value));
      formToSubmit = { ...form.value };
      if (!this.transaction_id) {
        delete formToSubmit.transaction_id;
      } else {
        formToSubmit.transaction_id = this.transaction_id;
      }
      formToSubmit["phone"] = String(formToSubmit["phone"]);
      delete formToSubmit["confirmpassword"];

      this.authservice
        .registrationRequest(formToSubmit)
        .pipe(
          timeout(20000)
        )
        .subscribe(
          val => {
            // this.alertContainer["instance"] = new Alert(
            //   "alert-soft-success fade show",
            //   "fa fa-check-circle alert-icon mr-3",
            //   "Registration was successfull!"
            // );
            this.toaster.showErrorMsg("Registration was successfull!");
            if (val.message) {
              setTimeout(() => {
                if (this.transaction_id) {
                  this.manageProcessIfTransactionIDIsPresent(
                    this.transaction_id
                  );
                  return;
                }
                this.router.navigate(["/dashboard"], {
                  queryParams: { returnUrl: "/billing" }
                });
              }, 2000);
            }
          },
          err => this.handleRegistrationError(err, btn)
        );
    }
  }

  // this is a getter for easy access to the password formcontrol Object
  get password() {
    return this.registrationForm.get("password");
  }

  // this is a getter for easy access to the fullname formcontrol Object
  get fullname() {
    return this.registrationForm.get("fullname");
  }

  // this is a getter for easy access to the confirmpassword formcontrol Object
  get confirmpassword() {
    return this.registrationForm.get("confirmpassword");
  }

  // this is a getter for easy access to the email formcontrol Object
  get email() {
    return this.registrationForm.get("email");
  }
  // this is a getter for easy access to the phone formcontrol Object
  get phone() {
    return this.registrationForm.get("phone");
  }

  // this function will enable us display appropriate error message when the
  // password has been touched and the user decides to leave
  public passwordIsRequired(): boolean {
    return this.password.hasError("required") && this.password.touched;
  }

  // this function will enable us display appropriate error message when the
  // values of password and confirmpassword dont match
  public passwordsDontMatch(): boolean {
    return this.confirmpassword.value !== this.password.value;
  }

  public passwordsMustBeOfCertainLength(): boolean {
    return this.password.hasError("minlength") && this.password.touched;
  }

  // this function will enable us display appropriate error message when the
  // phone field is touched without any input.
  public phoneNumberIsRequired(): boolean {
    return this.phone.touched && this.phone.hasError("required");
  }

  public phoneNumberDoesntConform(): boolean {
    return this.phone.touched && this.phone.hasError("minlength");
  }

  // this function will enable us display appropriate error message when the
  // email field is touched without any input.
  public emailIsRequired(): boolean {
    return this.email.hasError("required") && this.email.touched;
  }

  public emailDoesntConform(): boolean {
    return this.email.hasError("email") && this.email.touched;
  }

  // this function will enable us display appropriate error message when the
  // fullname field is touched without any input.
  public fullnameIsRequired(): boolean {
    return this.fullname.hasError("required") && this.fullname.touched;
  }

  removeInstance() {
    delete this.alertContainer["instance"];
  }

  // this function handles errors which may arise during registration
  handleRegistrationError(err, button: HTMLButtonElement) {
    // console.log(err);

    if (!window.navigator.onLine) {
      // console.log(err);
      // this.alertContainer["instance"] = new Alert(
      //   "alert-soft-danger fade show",
      //   "fa fa-minus-circle alert-icon mr-3",
      //   "You do not have an active internet connection. Please, check and try again"
      // );
      this.generalservice.loading4button(button, "done", "");
      this.toaster.showErrorMsg("You do not have an active internet connection. Please, check and try again");
      return;
    }
    if(err instanceof HttpErrorResponse  && err.status == 500){
      this.router.navigate(['dashboard']);
      return;
    }
    if (err instanceof HttpErrorResponse && err.status == 0) {
      // console.log(error);
      this.generalservice.loading4button(button, "done", "");
      // this.alertContainer["instance"] = new Alert(
      //   "alert-soft-danger fade show",
      //   "fa fa-minus-circle alert-icon mr-3",
      //   "You seem to have bad internet. Please try again"
      // );
      this.toaster.showErrorMsg("You seem to have bad internet. Please try again");
      // setTimeout(() => {
      //   delete this.alertContainer["instance"];
      // }, 3000);
    }
    if (err.name == "TimeoutError") {
      this.generalservice.loading4button(button, "done", "");
      // this.alertContainer["instance"] = new Alert(
      //   "alert-soft-danger fade show",
      //   "fa fa-minus-circle alert-icon mr-3",
      //   "The Server response timed out. Please try again"
      // );

      this.toaster.showErrorMsg("The Server response timed out. Please try again");

      // setTimeout(() => {
      //   delete this.alertContainer["instance"];
      // }, 3000);
    } else {
      // this.router.navigate(["/login"], {
      //   queryParams: { returnUrl: "/billing" }
      // });
      
      this.generalservice.loading4button(button, "done", "");
      // this.alertContainer["instance"] = new Alert(
      //   "alert-soft-danger fade show",
      //   "fa fa-minus-circle alert-icon mr-3",
      //   `${err.error.failed ? err.error.failed : err.error.error}`
      // );
      this.toaster.showErrorMsg(`${err.error.failed ? err.error.failed : err.error.error}`)

      // setTimeout(() => {
      //   delete this.alertContainer["instance"];
      // }, 3000);
    }
  }

  manageProcessIfTransactionIDIsPresent(transID: string) {
    sessionStorage.setItem("transactionID", transID);
    this.router.navigate(["/billing"]);
  }

}
