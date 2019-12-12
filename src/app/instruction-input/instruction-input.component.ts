import { Component, OnInit } from '@angular/core';
import { Instruction } from '../shared/models/instruction.model';

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

    this.memory = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
  }

  submitInstructionSet() {
    (document.getElementById('$zero') as HTMLInputElement).value = '0';
    let instructionSet: Array<Instruction> = new Array<Instruction>();
    const instructionRows: Array<string> = (document.getElementById('instructionList') as HTMLInputElement).value.split('\n');
    for (let i = 0; i < instructionRows.length; i++) {
      instructionSet[i] = this.createInstruction(instructionRows[i]);
    }
    this.executeInstructionSet(instructionSet);
  }

  createInstruction(instructionRow: any): Instruction {
    let instruction: Instruction = new Instruction;
    const parsedInstruction = instructionRow.valueOf().split(' ');
    switch (parsedInstruction[0].trim().toLowerCase()) {
      case 'add': { }
      case 'sub': {
        instruction = {
          command: parsedInstruction[0].trim().toLowerCase(),
          destinationRegister: parsedInstruction[1].replace(',', '').trim().toLowerCase(),
          input1: Number((document.getElementById(parsedInstruction[2].replace(',', '').trim()) as HTMLInputElement).value),
          input2: Number((document.getElementById(parsedInstruction[3].trim()) as HTMLInputElement).value)
        };
        break;
      }
      case 'addi': { }
      case 'subi': {
        instruction = {
          command: parsedInstruction[0].trim().toLowerCase(),
          destinationRegister: parsedInstruction[1].replace(',', '').trim().toLowerCase(),
          input1: Number((document.getElementById(parsedInstruction[2].replace(',', '').trim()) as HTMLInputElement).value),
          input2: Number(parsedInstruction[3].trim())
        };
        break;
      }
      default: {
        console.log('OOPS! Unable to find command!');
        break;
      }
    }
    return instruction;
  }

  executeInstructionSet(instructionSet: Array<Instruction>) {
    this.hazardDisplay = '';
    for (let i = 0; i < instructionSet.length; i++) {
      switch (instructionSet[i].command) {
        case 'add': { }
        case 'addi': {
          this.add(instructionSet[i]);
          this.hazardDisplay += this.displayHazard(instructionSet[i], i);
          break;
        }
        case 'sub': { }
        case 'subi': {
          this.sub(instructionSet[i]);
          this.hazardDisplay += this.displayHazard(instructionSet[i], i);
          break;
        }
        case 'sw': {
          console.log(instructionSet[i]);
          this.store(instructionSet, i);
          break;
        }
        case 'lw': {
          this.load(instructionSet, i);
          break;
        }
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


  add(instruction: Instruction) {
    (document.getElementById(instruction.destinationRegister) as HTMLInputElement).value =
      (instruction.input1 + instruction.input2).toString();
  }

  sub(instruction: Instruction) {
    (document.getElementById(instruction.destinationRegister) as HTMLInputElement).value =
      (instruction.input1 - instruction.input2).toString();
  }

  store(parsedInstruction: Array<Array<string>>, i: number) {
    const destinationRegister = parsedInstruction[i][1].replace(',', '').trim().toLowerCase();

    const parseAddress = parsedInstruction[i][2].valueOf().split('(');
    const offset = Number(parseAddress[0].trim()) / 4;
    const addressRegister = parseAddress[1].replace(')', '').trim().toLowerCase();
    const address = Number((document.getElementById(addressRegister) as HTMLInputElement).value);
    const newAddress = (offset + address).toString();

    (document.getElementById(newAddress) as HTMLInputElement).value = (document.getElementById(destinationRegister) as HTMLInputElement).value;
  }

  load(parsedInstruction: Array<Array<string>>, i: number) {
    const destinationRegister = parsedInstruction[i][1].replace(',', '').trim().toLowerCase();

    const parseAddress = parsedInstruction[i][2].valueOf().split('(');
    const offset = Number(parseAddress[0].trim()) / 4;
    const addressRegister = Number(parseAddress[1].replace(')', '').trim().toLowerCase());
    const newAddress = (offset + addressRegister).toString();

    (document.getElementById(destinationRegister) as HTMLInputElement).value = (document.getElementById(newAddress) as HTMLInputElement).value;
  }

  displayHazard(instruction: Instruction, i: number): string {
    let hazards = '';
    const hazardTable = (document.getElementById('hazardTable') as HTMLTableElement);

    if (i === 1) {
      if (instructionSet[i][2].replace(',', '').trim() === instructionSet[i - 1][1].replace(',', '').trim() ||
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
