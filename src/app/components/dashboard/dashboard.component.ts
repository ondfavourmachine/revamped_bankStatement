import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GeneralService } from 'src/app/services/general.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit {

  constructor(private generalservice: GeneralService, private router: Router) { 

  }

  ngOnInit(): void {
  }

  ngAfterViewInit(){
    setTimeout(() => {
      
     ( document.getElementById('preloader') as HTMLDivElement).style.visibility = 'hidden';
    }, 300);
  }


  logout(){
    this.generalservice.logOut();
    this.router.navigate(['login']);
  }
}
