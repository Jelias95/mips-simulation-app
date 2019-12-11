import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-instruction-input',
  templateUrl: './instruction-input.component.html',
  styleUrls: ['./instruction-input.component.scss']
})
export class InstructionInputComponent implements OnInit {
  registers: Array<string>;
  hazardDisplay = '';

  constructor() { }

  ngOnInit() {
    this.registers = ['$zero', '$at', '$v0', '$v1', '$a0', '$a1', '$a2', '$a3', '$t0', '$t1', '$t2', '$t3', '$t4', '$t5', '$t6', '$t7', '$s0', '$s1', '$s2', '$s3', '$s4', '$s5', '$s6', '$s7', '$t8', '$t9', '$k0', '$k1', '$gp', '$sp', '$fp', '$ra'];
  }

  submitInstructionSet() {
    const instructionSet: Array<string> = (document.getElementById('instructionList') as HTMLInputElement).value.split('\n');
    this.executeInstructionSet(instructionSet);
  }

  executeInstructionSet(instructionSet: Array<string>) {
    for (let i = 0; i < instructionSet.length; i++) {
      const parsedInstruction: Array<string> = instructionSet[i].valueOf().split(' ');
      const command = parsedInstruction[0].trim().toLowerCase();
      switch (command) {
        case 'add': {
          this.add(parsedInstruction, i);
          break;
        }
        default: {
          console.log('OOPS! Unable to find command!');
          break;
        }
      }
    }
  }

  add(parsedInstruction: Array<string>, commandNumber: number) {
    const storageRegister = parsedInstruction[1].replace(',', '').trim().toLowerCase();
    const total = +parsedInstruction[2].replace(',', '').trim() + +parsedInstruction[3].replace(',', '').trim();
    (document.getElementById(storageRegister) as HTMLInputElement).value = total.toString();
    const instructionTable = (document.getElementById('resultTable') as HTMLTableElement);

    const newRow = instructionTable.insertRow();

    for (let i = 0; i < commandNumber; i++) {
      let newCell = newRow.insertCell(i);
      let newText = document.createTextNode('');
      newCell.appendChild(newText);
    }

    let newCell = newRow.insertCell(commandNumber);
    let newText = document.createTextNode('IF');
    newCell.appendChild(newText);

    newCell = newRow.insertCell(commandNumber + 1);
    newText = document.createTextNode('ID');
    newCell.appendChild(newText);

    newCell = newRow.insertCell(commandNumber + 2);
    newText = document.createTextNode('EX');
    newCell.appendChild(newText);

    newCell = newRow.insertCell(commandNumber + 3);
    newText = document.createTextNode('M');
    newCell.appendChild(newText);

    newCell = newRow.insertCell(commandNumber + 4);
    newText = document.createTextNode('W');
    newCell.appendChild(newText);
  }

}
