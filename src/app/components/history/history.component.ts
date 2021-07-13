import { Component, Input, OnInit } from '@angular/core';
import { Transactions } from 'src/app/models/transactionHistory';
import { GeneralService } from 'src/app/services/general.service';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit {
 @Input('data') data: Transactions[];
  constructor(public generalservice: GeneralService) { }

  ngOnInit(): void {
    console.log(this.data[0].file_url_remote);
  }

}
