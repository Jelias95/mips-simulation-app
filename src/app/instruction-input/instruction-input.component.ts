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
    const hazardList = [];
    for (let i = 0; i < instructionSet.length; i++) {
      const parsedInstruction: Array<string> = instructionSet[i].valueOf().split(' ');
      const command = parsedInstruction[0].trim().toLowerCase();
      switch (command) {
        case 'add': {
          this.add(parsedInstruction);
          this.insertInitialInstruction(i);
          // this.checkDataHazard(hazardList, i, parsedInstruction, instructionSet);
          break;
        }
        default: {
          console.log('OOPS! Unable to find command!');
          break;
        }
      }
    }
  }

  add(parsedInstruction: Array<string>) {
    const storageRegister = parsedInstruction[1].replace(',', '').trim().toLowerCase();
    const total = +parsedInstruction[2].replace(',', '').trim() + +parsedInstruction[3].replace(',', '').trim();
    (document.getElementById(storageRegister) as HTMLInputElement).value = total.toString();
  }

  insertInitialInstruction(commandNumber: number) {
    const instructionTable = (document.getElementById('resultTable') as HTMLTableElement);
    const newRow = instructionTable.insertRow(commandNumber);
    for (let i = 0; i < commandNumber; i++) {
      const newCell = newRow.insertCell(i);
      const newText = document.createTextNode('');
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

  insertHazardInstruction() { }

  checkDataHazard(hazardList: Array<number>, index: number, currentInstruction: Array<string>, instructionSet: Array<string>): Array<number> {
    for (let i = index + 1; i < index + 4; i++) {
      if (instructionSet[i].includes(currentInstruction[1].replace(',', '').trim().toLowerCase()))
      {
        hazardList.push(i);
      }
    }
    return hazardList;
  }
}
