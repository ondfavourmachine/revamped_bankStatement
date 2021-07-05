import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CoreModule } from './modules/coreModule/core/core.module';
import { Angular4PaystackModule } from 'angular4-paystack';
import { HttpInterceptProviders } from './http-Interceptors';
import { AuthService } from './services/auth.service';
import { GeneralService } from './services/general.service';
import { PaymentService } from './services/Payments/payment.service';
import { AuthGuard } from './guards/AuthGuard/auth.guard';
import { ToasterService } from './services/Toaster/toaster.service';
import { ToastrModule } from 'ngx-toastr';
import { HttpClientModule } from '@angular/common/http';
import { AnalysisComponentComponent } from './components/analysis-component/analysis-component.component';
import { SummaryComponent } from './components/summary/summary.component';
import { HistoryComponent } from './components/history/history.component';
// import { NgxChartsModule } from '@swimlane/ngx-charts';
import { ChartsModule } from 'ng2-charts';
import { InitiateBankStatementComponent } from './components/initiate-bank-statement/initiate-bank-statement.component';
import { AddAccountDetailsComponent } from './components/add-account-details/add-account-details.component';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SignupComponent,
    DashboardComponent,
    AnalysisComponentComponent,
    SummaryComponent,
    HistoryComponent,
    InitiateBankStatementComponent,
    AddAccountDetailsComponent
  ],
  imports: [
    NgxSkeletonLoaderModule.forRoot({ animation: 'pulse', appearance: 'line' }),
    FormsModule,
    ReactiveFormsModule,
    BrowserModule,
    BrowserAnimationsModule,
    Angular4PaystackModule.forRoot(
      "pk_test_6feb7dca80f00bc32d576032fe06b48b0a77708f"
    ),
    ToastrModule.forRoot(),
    // NgxChartsModule,
    ChartsModule,
    CoreModule,
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [
    HttpInterceptProviders,
    AuthService,
    GeneralService,
    ToasterService,
    PaymentService,
    AuthGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
