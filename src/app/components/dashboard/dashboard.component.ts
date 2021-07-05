import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GeneralService } from 'src/app/services/general.service';
import { Bank, DashboardData, User } from "../../models/dashboard-data";
import { StatementsRecentlyAnalysed } from "src/app/models/StatementsRecentlyAnalysed";
import {
  PaymentApi,
  PaymentPlans,
  PaymentInitiationReturnVal
} from "../../models/PaymentPlans";
import { defer, Subscription } from 'rxjs';
import { AlertObject } from 'src/app/models/Alert';
import { timeout } from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/User/user.service';
import { Transactions } from 'src/app/models/transactionHistory';
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import { Color, Label } from 'ng2-charts';
declare var CreditClan: any;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit {
  screensize: string = "desktop";
  origin: string;
  currentUser: User = {};
  loadingHistory: boolean = true;
  // this.generalservice.checkDisplayAndSetAppropriateView();
  theUserDetails: object = {};
  payStackPayment: PaymentApi;
  totalStatements: string | number;
  preventMemoryLeakage: Subscription;
  dashBoardDataFromApiCall: DashboardData = {};
  currentUsersSubscription: PaymentPlans;
  dontShow: boolean = false;
  userWantsToSendCustomerForBS: boolean = false;
  NigerianBanks: Bank[] = [];
  userDetails = {}
  componentToDisplay: 'summary' | 'history' | 'initiate' | 'add_account' | '' = '';
  transactionsHistoryTable: Transactions[] = [];
  dataForComponent = {};
  noAccountCollection: boolean = false;

  public alertContainer: AlertObject = { instance: null };

  cc: any;

  public title: string;

  barChartOptions: ChartOptions = {
    responsive: true,
  };
  barChartLabels: Label[] = ['Apple', 'Banana', 'Kiwifruit', 'Blueberry', 'Orange', 'Grapes'];
  barChartType: ChartType = 'bar';
  barChartLegend = true;
  barChartPlugins = [];

  barChartData: ChartDataSets[] = [

    { data: [45, 37, 60, 70, 46, 33], label: 'Best Fruits', backgroundColor: '#126AFF', hoverBackgroundColor: '#ff9800', pointHoverBackgroundColor: '#ff9800' }
  ];

  

  constructor(
    private userservice: UserService,
    private authservice: AuthService, private generalservice: GeneralService, private router: Router) { 

  }

  ngOnInit(): void {
    this.retrieveAllDashboardData();
  }


  ngAfterViewInit(){
    
    

    
    this.getUserDetails();
    // this.attachDynamicClickEvent();
    this.checkIfTransactionIDIsPresentAndHandleIt();
    const token = this.generalservice.getSavedToken()
      ? `Bearer ${this.generalservice.getSavedToken()}`
      : null;
    try {
      this.cc = CreditClan.init("z2BhpgFNUA99G8hZiFNv77mHDYcTlecgjybqDACv", {
        class: "ccopen",
        token: token
      });
    } catch (e) {
      this.generalservice.globalNotificationModal(e);
    }

    this.fetchStatementHistory();
  }

  async retrieveAllDashboardData() {
    let totalStatements = document.getElementById(
      "totalStatements"
    ) as HTMLHeadingElement;
    let emailVerification = document.getElementById(
      "emailVerification"
    ) as HTMLParagraphElement;
    // typescript mixin is really awesome!
    const tempDashBoardData: DashboardData & Object = {
      ...this.generalservice.getUserSavedDataFromStorage()
    };
    if (tempDashBoardData.hasOwnProperty("completed")) {
      this.dashBoardDataFromApiCall = { ...tempDashBoardData };
      this.insertTheNecessaryDataIntoDashboard(this.dashBoardDataFromApiCall);
      return;
    }
    this.preventMemoryLeakage = defer(
      async () => await this.fetchDashBoardDetails()
    )
      .pipe(timeout(60000))
      .subscribe(
        (val: DashboardData) => {
          console.log(val);
          this.dashBoardDataFromApiCall = { ...val };
          let topupAnchor = document.getElementById(
            "topup"
          ) as HTMLButtonElement;
          this.disableAnalyseButton(this.dashBoardDataFromApiCall);
          this.totalStatements =
            val.user.transactions_left == 0
              ? "0"
              : val.user.transactions_left.toString().substring(0, 4);
          totalStatements.innerText = this.totalStatements.toString();
          this.handleUserEmailNotVerified(
            this.dashBoardDataFromApiCall,
            emailVerification
          );
          this.handleUserDoesNotHaveActivePlan(
            this.dashBoardDataFromApiCall,
            topupAnchor
          );
        },
        err => {
          // console.log(err);
          this.handleError(err, totalStatements, emailVerification);
        }
      );
  }

 

  getUserDetails(): void {
    this.userDetails = { ...this.generalservice.getAndDecryptPayloadData() };
  }

  handleError(
    e,
    statement: HTMLParagraphElement,
    emailHolder: HTMLParagraphElement
  ) {
    if (e.name == "TimeoutError") {
      statement.textContent = "!";
      this.dashBoardDataFromApiCall = { user: { fullname: "!" } };
      this.modifyParagraphHoldingEmailVerificationMessage(emailHolder);
    } else {
      statement.textContent = "!";
      this.dashBoardDataFromApiCall = { user: { fullname: "!" } };
      this.modifyParagraphHoldingEmailVerificationMessage(emailHolder);
    }
  }

  private checkIfTransactionIDIsPresentAndHandleIt() {
    const transactionID = sessionStorage.getItem("transactionID");
    // console.log(transactionID);
    if (transactionID) {
      this.processExistingTransactionID(transactionID);
    }
  }

  async processExistingTransactionID(transID: string) {
    // console.log(this.dashBoardDataFromApiCall);
    if (this.dashBoardDataFromApiCall.user == undefined) {
      // console.log(this.dashBoardDataFromApiCall);
      return;
    } else {
      if (this.dashBoardDataFromApiCall.user.transactions_left >= 1) {
        try {
          const response: StatementsRecentlyAnalysed = await this.analyseTransID(
            transID
          );
          this.generalservice.globalNotificationModal(response);
        } catch (e) {
          // console.log(e);
          sessionStorage.removeItem("transactionID");
        }
      }
    }
  }

  analyseTransID(ID: string): Promise<any> {
    return this.authservice.getRecentlyAnalysedStatements(ID);
  }


  insertTheNecessaryDataIntoDashboard(val) {
    console.log(val);
    // let emailVerification = document.getElementById(
    //   "emailVerification"
    // ) as HTMLParagraphElement;
    // let totalStatements = document.getElementById(
    //   "totalStatements"
    // ) as HTMLHeadingElement;
    // let topupAnchor = document.getElementById("topup") as HTMLButtonElement;
    // this.disableAnalyseButton(this.dashBoardDataFromApiCall);
    // this.totalStatements =
    //   val.user.transactions_left == 0
    //     ? "0"
    //     : val.user.transactions_left.toString().substring(0, 4);
    // totalStatements.innerText = this.totalStatements.toString();
    // this.handleUserEmailNotVerified(
    //   this.dashBoardDataFromApiCall,
    //   emailVerification
    // );
    // this.handleUserDoesNotHaveActivePlan(
    //   this.dashBoardDataFromApiCall,
    //   topupAnchor
    // );
    const {user} = val;
    this.currentUser = user;
    setTimeout(() => {
      
      ( document.getElementById('preloader') as HTMLDivElement).style.visibility = 'hidden';
     }, 300);
    
  }

  disableAnalyseButton(currentUserDetails: DashboardData) {
    const buttonAnalyse = document.getElementById(
      "buttonAnalyse"
    ) as HTMLAnchorElement;
    if (
      !currentUserDetails.user.current_package_validity ||
      currentUserDetails.user.transactions_left < 1
    ) {
      buttonAnalyse.style.pointerEvents = "none";
    } else {
      buttonAnalyse.style.pointerEvents = "auto";
    }
  }

  handleUserEmailNotVerified(data: DashboardData, p: HTMLParagraphElement) {
    if (!data.user.email_verified) {
      this.modifyParagraphHoldingEmailVerificationMessage(p);
    } else {
      this.emailVerified(p);
    }
  }

  handleUserDoesNotHaveActivePlan(data: DashboardData, a: HTMLButtonElement) {
    if (data.user.transactions_left < 1) {
      a.textContent = "Subscribe";
    } else if (
      data.user.transactions_left >= 1 &&
      data.user.transactions_left < 3
    ) {
      a.textContent = "Top Up";
    } else {
      a.textContent = "Top Up";
    }
  }

  emailVerified(p: HTMLParagraphElement) {
    p.innerHTML = `<i class="fa fa-check-circle fa-2x"></i> Email Verified`;
    p.removeEventListener("click", this.verifyUserEmail);
    this.title = "Email verified!";
    p.style.cursor = "auto";
    this.dontShow = true;
  }


  modifyParagraphHoldingEmailVerificationMessage(p: HTMLParagraphElement) {
    this.dontShow = true;
    p.textContent = "Email not verified!";
    this.title = "Click to verify your email!";
    p.style.cursor = "pointer";
    this;
    p.addEventListener("click", () => {
      this.verifyUserEmail();
    });
  }


  async verifyUserEmail() {
    const email = this.dashBoardDataFromApiCall.user.email;
    const hiddenSecondModalButton = document.getElementById(
      "hiddenSecondModalButton"
    ) as HTMLButtonElement;
    const emailVerification = document.getElementById(
      "emailVerification"
    ) as HTMLParagraphElement;
    const imagePlaceHolder = document.getElementById(
      "imagePlaceHolder"
    ) as HTMLDivElement;
    const insideLife = document.querySelector(".insideLife") as HTMLDivElement;
    this.dontShow = false;
    defer(async () => await this.verifyEmail(email))
      .pipe(timeout(20000))
      .subscribe(
        val => {
          if (val) {
            this.dontShow = true;
            hiddenSecondModalButton.click();
            this.sentActivationLinkSuccessfully(
              hiddenSecondModalButton,
              emailVerification,
              imagePlaceHolder,
              insideLife
            );
          }
        },
        err => {
          this.handleErrorsFromSendingEmails(
            err,
            hiddenSecondModalButton,
            emailVerification,
            imagePlaceHolder,
            insideLife
          );
        }
      );
  }

  verifyEmail(email: string): Promise<any> {
    return this.userservice.sendEmail({ email: email }).toPromise();
  }

  handleErrorsFromSendingEmails(
    e,
    btn: HTMLButtonElement,
    p: HTMLParagraphElement,
    imgPH: HTMLDivElement,
    inner: HTMLDivElement
  ) {
    imgPH.innerHTML = `
    <img
    style="object-fit: cover;"
    class="img-fluid position-relative u-z-index-3 "
    src="../../../assets/svg/mockups/no-response.svg"
    alt="Image description"
  />`;
    inner.innerHTML = `
  <p style="color: #222222;">
   Unable to send activation email to
   <span style="font-weight: 400; color: #ff9800">
    ${this.dashBoardDataFromApiCall.user.email}
  </span>
   Please try again later!
  </p>
  `;
    this.dontShow = true;
    btn.click();
  }

  sentActivationLinkSuccessfully(
    btn: HTMLButtonElement,
    p: HTMLParagraphElement,
    imgPH: HTMLDivElement,
    inner: HTMLDivElement
  ) {
    imgPH.innerHTML = `
      <img
      style="object-fit: cover;"
      class="img-fluid position-relative u-z-index-3 "
      src="../../../assets/svg/mockups/email-sent.svg"
      alt="Image description"
    />`;
    inner.innerHTML = `
      <p style="color: #222222;">
      Activation email has been sent to
      <span style="font-weight: 400; color: #ff9800">
        ${this.dashBoardDataFromApiCall.user.email}
      </span>
    </p>
    `;
    this.dontShow = true;
    btn.click();
  }

  async fetchDashBoardDetails(): Promise<any> {
    return await this.userservice.getDashboardData().toPromise();
  }

  async submitRequestToChangeStuff(
    valueToChange: object,
    btn: HTMLButtonElement
  ): Promise<any> {
    this.generalservice.loading4button(btn, "yes", "Please wait...");
    return await this.userservice
      .updateAllOrAnyProfileField(valueToChange)
      .toPromise();
  }

  fetchStatementHistory(){
    this.loadingHistory = true;
    this.userservice.getHistoryOfUserAnalysedStatements().subscribe(
      val => {
        document.querySelector('.statements_left').textContent = `${val.transactions.length}`;
        this.transactionsHistoryTable = val.transactions;
        this.loadingHistory = false;   
      },
      err => {
        console.log(err);
        this.loadingHistory = false;
      }
    )
  }

  logout(){
    this.generalservice.logOut();
    this.router.navigate(['login']);
  }

  viewHistory(transaction: Transactions){
   ( document.getElementById('triggerForOffCanvas') as HTMLElement).click();
   
   const { 
     average_monthly_deposit, 
     average_monthly_withdraw, 
     total_loans_disbursed, 
     total_deposit, 
     total_loans_repaid 
    } = transaction.summary;
    const data = {average_monthly_deposit, average_monthly_withdraw, total_loans_disbursed, total_deposit, total_loans_repaid};
    for(let d in data){
      this.dataForComponent[d] = this.modifyAnalysisData(data[d]);
    }
    this.componentToDisplay = 'summary';
  }

  modifyAnalysisData(number: number){
    if(!number) return number;
    let num: any = number.toFixed(2);
    num = parseInt(num);
   return  (new Intl.NumberFormat('en').format( num ));
  }


  clickHiddenAnchorToStartAnalysisProcess(anchor?: string): void {
    let ccopen = document.querySelector(".ccopen") as HTMLAnchorElement;
    ccopen.click();
    try {
      if (CreditClan.iframe) {
        this.generalservice.loading4Anchor(ccopen, "done", "Analyse");
        // console.log('i am working')
      }
    } catch (e) {
      this.generalservice.globalNotificationModal(e);
      this.generalservice.loading4Anchor(ccopen, "done", "Analyse");
    }
    // else {
    //   console.error;
    // }
  }

  allHistory(){
    ( document.getElementById('triggerForOffCanvas') as HTMLElement).click();
    this.componentToDisplay = 'history';
    this.dataForComponent = this.transactionsHistoryTable;
  }

  initiateBankStatementForCustomer(){
    this.componentToDisplay = 'initiate';
    document.getElementById('triggerForOffCanvas').click();
  }

  startAccountAddition(event: string){
    if(event == 'add'){
      (document.querySelector('.btn-close') as HTMLElement).click();
      setTimeout(() => {
        this.noAccountCollection = false;
        this.componentToDisplay = 'add_account';
        document.getElementById('triggerForOffCanvas').click();
      }, 600);
    }else{
      this.noAccountCollection = true;
      (document.querySelector('.btn-close') as HTMLElement).click();
      setTimeout(() => {
        this.componentToDisplay = 'add_account';
        document.getElementById('triggerForOffCanvas').click();
      }, 600);
    }
  
  }

  returnSomething(something: any): string{
    if(something) return `${something}%`;
    else return 'Not Avalaible';
  }
}
