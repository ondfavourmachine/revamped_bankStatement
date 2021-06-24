import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.css']
})
export class SummaryComponent implements OnInit {
 @Input('data') data;
  constructor() { }

  ngOnInit(): void {
  }


  makeHumanReadable(number): any{
    console.log(number);
  }

}
