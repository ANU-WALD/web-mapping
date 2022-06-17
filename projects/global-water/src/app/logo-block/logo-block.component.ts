import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-logo-block',
  templateUrl: './logo-block.component.html',
  styleUrls: ['./logo-block.component.scss']
})
export class LogoBlockComponent implements OnInit {
  logos = [
    {
      url:'https://anu.edu.au',
      label:'Australian National University',
      image:'2x_anu_logo_small_black.png'
    },
    {
      url:'https://www.wur.nl/en/Research-Results/Chair-groups/Environmental-Sciences/Hydrology-and-Quantitative-Water-Management-Group.htm',
      label:'Wageningen University & Research',
      image:'WUR_stack_transp.png'
    },
    {
      url:'http://www.gloh2o.org/mswx/',
      label:'GloH2O - Multi Source Weather',
      image:'GloH2O-logo-recoloured.png'
    }
  ]

  constructor() { }

  ngOnInit(): void {
  }

}
