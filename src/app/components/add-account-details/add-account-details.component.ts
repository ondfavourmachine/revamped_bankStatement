import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Bank } from 'src/app/models/dashboard-data';
import { GeneralService } from 'src/app/services/general.service';
import { ToasterService } from 'src/app/services/Toaster/toaster.service';
import { UserService } from 'src/app/services/User/user.service';

@Component({
  selector: 'app-add-account-details',
  templateUrl: './add-account-details.component.html',
  styleUrls: ['./add-account-details.component.css']
})
export class AddAccountDetailsComponent implements OnInit, OnChanges {
  @Input('noAccountCollection') noAccountCollection: string;
  NigerianBanks: Bank[] = [];
  collectBankInformation: FormGroup;
  urlProvided: boolean = false;
  url: string = undefined;
  page: 'add_account' | 'successful' = 'add_account';
  checkingAcct: boolean = false;
  constructor(
    private userservice: UserService, 
    private fb: FormBuilder,
    private generalservice: GeneralService,
    private toaster: ToasterService
    ) { }

  ngOnChanges(){
    console.log(this.noAccountCollection);
  }

  ngOnInit(): void {
    this.collectBankInformation = this.fb.group({
      account_number: ['', Validators.required],
      account_name: ['', Validators.required],
      bank_id: ['', Validators.required],
      start_date: ['', Validators.required],
      end_date: ['', Validators.required],
      name: ['', Validators.required],
      email: ['', Validators.required],
      phone: ['', Validators.required]
    })
    this.getAllBanks();
    
  }
  
  get account_name () {
    return this.collectBankInformation.get('account_name');
  }

  get account_number () {
    return this.collectBankInformation.get('account_number');
  }

  get bank_id () {
    return this.collectBankInformation.get('bank_id');
  }
   
  getAllBanks(){
    this.userservice.fetchBankNames().subscribe(
      val => this.NigerianBanks = val,
      err => console.log(err)
    )
  }

  addCustomerAcctDetails(form: FormGroup, event: Event){
    const btn = event.target as HTMLButtonElement;
    const {account_name, account_number, bank_id, email, end_date, name, phone, start_date} = form.value;
    const formToSubmit = {
      profile: {name, phone, email},
      account: {account_name, account_number, bank_id},
      token: this.generalservice.getCreditClanSavedToken(),
      start_date,
      end_date
    }

    const reqBodyForSendingRequest = {
      profile: {name, phone, email},
      token: this.generalservice.getCreditClanSavedToken(),
      start_date,
      end_date
    }
    this.generalservice.loading4button(btn, 'yes', 'initiating...')
    this.userservice.initiateBSForACustomer(this.noAccountCollection ? reqBodyForSendingRequest :  formToSubmit)
    .subscribe(
      val => {
        const {message, url} = val;
        console.log(val);
        if(url){
          this.page = 'successful';
          this.toaster.showSuccessMsg(message);
          this.urlProvided = true;
          this.url = url;
        }else{
          this.page = 'successful';
          this.toaster.showSuccessMsg(message);
          this.urlProvided = false;
        }
       
        this.generalservice.loading4button(btn, "done", 'initiate');
      },
      
      err => {
        this.generalservice.loading4button(btn, "done", 'initiate');
      }
    )
  }

  
  fetchBankAcct(event: Event){
    const acct_num = this.account_number.value;
    const acct_bank = this.bank_id.value;
    if(!acct_num) return;
    if(!acct_bank) return;
    this.checkingAcct = true;
    this.userservice.confirmAccountDetailsOfParent({account_number: acct_num, bank_code: acct_bank})
     .subscribe(
       val => {this.account_name.patchValue(val.data.account_name); this.checkingAcct = false},
       err => console.log(err)
     )
  }

  numberOnly(event: KeyboardEvent){
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  copyThisLink(url: string, event: Event){
    const input = document.createElement('input') as HTMLInputElement;
    const span = event.target as HTMLSpanElement;
    const prevText = span.textContent;
    input.value = this.url || url;
    document.body.appendChild(input);
    input.select();
    input.setSelectionRange(0, 99999); /*For mobile devices*/
    document.execCommand('copy');
    span.textContent = 'Copied!';
    setTimeout(() => {
      span.textContent = prevText;
    }, 1500);
    
    document.body.removeChild(input);
  }
}
