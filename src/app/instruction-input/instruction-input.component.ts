import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-instruction-input',
  templateUrl: './instruction-input.component.html',
  styleUrls: ['./instruction-input.component.scss']
})
export class InstructionInputComponent implements OnInit {
  registers: Array<string>;
  memory: Array<number>;
  hazardDisplay = '';

  constructor() { }

  ngOnInit() {
    this.registers = ['$zero', '$at', '$v0', '$v1', '$a0', '$a1', '$a2', '$a3', '$t0', '$t1', '$t2', '$t3', '$t4', '$t5', '$t6', '$t7', '$s0', '$s1', '$s2', '$s3', '$s4', '$s5', '$s6', '$s7', '$t8', '$t9', '$k0', '$k1', '$gp', '$sp', '$fp', '$ra'];

    // TODO: Memory is incorrect, look at how load and store word work
    this.memory = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
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
        case 'sw': {
          this.store(parsedInstruction);
          this.insertInitialInstruction(i);
          break;
        }
        case 'lw': {
          this.load(parsedInstruction);
          this.insertInitialInstruction(i);
          break;
        }
        case 'sub': {
          this.sub(parsedInstruction);
          this.insertInitialInstruction(i);
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
    const destinationRegister = parsedInstruction[1].replace(',', '').trim().toLowerCase();

    const firstNum = Number((document.getElementById(parsedInstruction[2].replace(',', '').trim()) as HTMLInputElement).value);
    const secondNum = Number((document.getElementById(parsedInstruction[3].replace(',', '').trim()) as HTMLInputElement).value);

    (document.getElementById(destinationRegister) as HTMLInputElement).value = (firstNum + secondNum).toString();
  }

  store(parsedInstruction: Array<string>) {
    const destinationRegister = parsedInstruction[1].replace(',', '').trim().toLowerCase();

    const parseAddress = parsedInstruction[2].valueOf().split('(');
    const offset = parseAddress[0].trim();
    const addressRegister = parseAddress[1].replace(')', '').trim().toLowerCase();
    const newAddress = (+offset + +addressRegister).toString();

    (document.getElementById(newAddress) as HTMLInputElement).value = (document.getElementById(destinationRegister) as HTMLInputElement).value;
  }

  load(parsedInstruction: Array<string>) {
    const destinationRegister = parsedInstruction[1].replace(',', '').trim().toLowerCase();

    const parseAddress = parsedInstruction[2].valueOf().split('(');
    const offset = parseAddress[0].trim();
    const addressRegister = parseAddress[1].replace(')', '').trim().toLowerCase();
    const newAddress = (+offset + +addressRegister).toString();

    (document.getElementById(destinationRegister) as HTMLInputElement).value = (document.getElementById(newAddress) as HTMLInputElement).value;
  }

  sub(parsedInstruction: Array<string>) {
    const destinationRegister = parsedInstruction[1].replace(',', '').trim().toLowerCase();

    const firstNum = Number((document.getElementById(parsedInstruction[2].replace(',', '').trim()) as HTMLInputElement).value);
    const secondNum = Number((document.getElementById(parsedInstruction[3].replace(',', '').trim()) as HTMLInputElement).value);

    (document.getElementById(destinationRegister) as HTMLInputElement).value = (firstNum - secondNum).toString();
  }

  // TODO: This instruction is wrong, need to detect hazards first, then print out with stalls before printing updated version

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
