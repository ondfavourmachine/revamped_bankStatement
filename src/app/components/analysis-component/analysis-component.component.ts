import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-analysis-component',
  templateUrl: './analysis-component.component.html',
  styleUrls: ['./analysis-component.component.css']
})
export class AnalysisComponentComponent implements OnInit {
@Input('type') type: string;
  constructor() { }

  ngOnInit(): void {
  }

}
