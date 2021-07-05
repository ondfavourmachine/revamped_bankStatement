import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-initiate-bank-statement',
  templateUrl: './initiate-bank-statement.component.html',
  styleUrls: ['./initiate-bank-statement.component.css']
})
export class InitiateBankStatementComponent implements OnInit {
  @Output('accountAdd') accountAdd = new EventEmitter<string>();
  constructor() { }

  ngOnInit(): void {
  }


  addAccount(){
    this.accountAdd.emit('add')
  }


  sendRequestInstead(){
    this.accountAdd.emit('sendRequest')
  }

}
