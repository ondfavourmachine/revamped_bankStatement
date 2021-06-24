import { Component, Input, OnInit } from '@angular/core';
import { Transactions } from 'src/app/models/transactionHistory';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit {
 @Input('data') data: Transactions[];
  constructor() { }

  ngOnInit(): void {
  }

}
