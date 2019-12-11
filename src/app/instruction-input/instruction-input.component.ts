import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-instruction-input',
  templateUrl: './instruction-input.component.html',
  styleUrls: ['./instruction-input.component.scss']
})
export class InstructionInputComponent implements OnInit {
  registers: Array<string>;
  memory: Array<number>;
  hazardDisplay: string;

  constructor() { }

  ngOnInit() {
    this.registers = ['$zero', '$at', '$v0', '$v1', '$a0', '$a1', '$a2', '$a3', '$t0', '$t1', '$t2', '$t3', '$t4', '$t5', '$t6', '$t7', '$s0', '$s1', '$s2', '$s3', '$s4', '$s5', '$s6', '$s7', '$t8', '$t9', '$k0', '$k1', '$gp', '$sp', '$fp', '$ra'];

    // TODO: Memory is incorrect, look at how load and store word work
    this.memory = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
  }

  submitInstructionSet() {
    (document.getElementById('$zero') as HTMLInputElement).value = '0';
    const instructionRows: Array<string> = (document.getElementById('instructionList') as HTMLInputElement).value.split('\n');
    let instructionSet: Array<Array<string>> = new Array<Array<string>>();
    for (let i = 0; i < instructionRows.length; i++) {
      instructionSet[i] = instructionRows[i].valueOf().split(' ');
      console.log(instructionSet);
    }
    this.executeInstructionSet(instructionSet);
  }

  executeInstructionSet(instructionSet: Array<Array<string>>) {
    this.hazardDisplay = '';
    for (let i = 0; i < instructionSet.length; i++) {
      const command = instructionSet[i][0].trim().toLowerCase();
      switch (command) {
        case 'add': {
          this.add(instructionSet, i);
          this.hazardDisplay += this.displayHazard(instructionSet, i);
          break;
        }
        case 'addi': {
          this.addi(instructionSet, i);
          this.hazardDisplay += this.displayHazard(instructionSet, i);
          // this.displayHazardi(i);
          break;
        }
        // case 'sw': {
        //   this.store(parsedInstruction);
        //   this.insertInitialInstruction(i);
        //   break;
        // }
        // case 'lw': {
        //   this.load(parsedInstruction);
        //   this.insertInitialInstruction(i);
        //   break;
        // }
        // case 'sub': {
        //   this.sub(parsedInstruction);
        //   this.insertInitialInstruction(i);
        //   break;
        // }
        default: {
          console.log('OOPS! Unable to find command!');
          break;
        }
      }
    }
    this.hazardDisplay.length > 0 ?
      (document.getElementById('hazardList') as HTMLInputElement).value = this.hazardDisplay
      : (document.getElementById('hazardList') as HTMLInputElement).value = 'No Hazards Found';
  }


  add(parsedInstruction: Array<Array<string>>, i: number) {
    const destinationRegister = parsedInstruction[i][1].replace(',', '').trim().toLowerCase();

    const firstNum = Number((document.getElementById(parsedInstruction[i][2].replace(',', '').trim()) as HTMLInputElement).value);
    const secondNum = Number((document.getElementById(parsedInstruction[i][3].replace(',', '').trim()) as HTMLInputElement).value);

    (document.getElementById(destinationRegister) as HTMLInputElement).value = (firstNum + secondNum).toString();
  }

  addi(parsedInstruction: Array<Array<string>>, i: number) {
    const destinationRegister = parsedInstruction[i][1].replace(',', '').trim().toLowerCase();

    const firstNum = Number((document.getElementById(parsedInstruction[i][2].replace(',', '').trim()) as HTMLInputElement).value);
    const secondNum = Number(parsedInstruction[i][3].replace(',', '').trim());

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

  displayHazard(instructionSet: Array<Array<string>>, i: number): string {
    let hazards = '';
    const hazardTable = (document.getElementById('hazardTable') as HTMLTableElement);

    if (i === 1) {
      if (instructionSet[i][2].replace(',' , '').trim() === instructionSet[i - 1][1].replace(',', '').trim() ||
        instructionSet[i][3].replace(',', '').trim() === instructionSet[i - 1][1].replace(',', '').trim()) {
          hazards += 'Data Hazard: Instructions ' + (i - 1) + ' and ' + i + ' use register ' + instructionSet[i - 1][1].replace(',', '').trim() + '. Implement Fowarding.';
        }
    }
    this.noStall(i, hazardTable);
    return hazards;
  }

  noStall(i: number, table: HTMLTableElement) {
    const newRow = table.insertRow(i);

    for (let j = 0; j < i; j++) {
      const newCell = newRow.insertCell(j);
      const newText = document.createTextNode('');
      newCell.appendChild(newText);
    }

    let newCell = newRow.insertCell(i);
    let newText = document.createTextNode('IF');
    newCell.appendChild(newText);

    newCell = newRow.insertCell(i + 1);
    newText = document.createTextNode('ID');
    newCell.appendChild(newText);

    newCell = newRow.insertCell(i + 2);
    newText = document.createTextNode('EX');
    newCell.appendChild(newText);

    newCell = newRow.insertCell(i + 3);
    newText = document.createTextNode('M');
    newCell.appendChild(newText);

    newCell = newRow.insertCell(i + 4);
    newText = document.createTextNode('W');
    newCell.appendChild(newText);
  }
}
