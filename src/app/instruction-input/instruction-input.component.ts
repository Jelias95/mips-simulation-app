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
    const instructionRows: Array<string> = (document.getElementById('instructionList') as HTMLInputElement).value.split('\n');
    this.executeInstructionSet(instructionRows);
  }

  createInstruction(instructionRow: string): Instruction {
    let instruction: Instruction = new Instruction();
    const parsedInstruction = instructionRow.valueOf().split(' ');
    switch (parsedInstruction[0].trim().toLowerCase()) {
      case 'add': { }
      case 'sub': {
        instruction = {
          command: parsedInstruction[0].trim().toLowerCase(),
          destinationRegister: parsedInstruction[1].replace(',', '').trim().toLowerCase(),
          input1: Number((document.getElementById(parsedInstruction[2].replace(',', '').trim()) as HTMLInputElement).value),
          input2: Number((document.getElementById(parsedInstruction[3].trim()) as HTMLInputElement).value),
          usedRegisters: [
            parsedInstruction[2].replace(',', '').trim(),
            parsedInstruction[3].trim()
          ]
        };
        break;
      }
      case 'addi': { }
      case 'subi': {
        instruction = {
          command: parsedInstruction[0].trim().toLowerCase(),
          destinationRegister: parsedInstruction[1].replace(',', '').trim().toLowerCase(),
          input1: Number((document.getElementById(parsedInstruction[2].replace(',', '').trim()) as HTMLInputElement).value),
          input2: Number(parsedInstruction[3].trim()),
          usedRegisters: [
            parsedInstruction[2].replace(',', '').trim()
          ]
        };
        break;
      }
      case 'lw': { }
      case 'sw': {
        const parseAddress = parsedInstruction[2].valueOf().split('(');
        instruction = {
          command: parsedInstruction[0].trim().toLowerCase(),
          destinationRegister: parsedInstruction[1].replace(',', '').trim().toLowerCase(),
          input1: Number(parseAddress[0].trim()) / 4,
          input2: Number((document.getElementById(parseAddress[1].replace(')', '').trim().toLowerCase()) as HTMLInputElement).value),
          usedRegisters: [
            parseAddress[1].replace(')', '').trim().toLowerCase()
          ]
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

  executeInstructionSet(instructionRows: Array<string>) {
    const instructionSet: Array<Instruction> = new Array<Instruction>();
    this.hazardDisplay = '';
    for (let i = 0; i < instructionRows.length; i++) {
      const parsedInstruction = instructionRows[i].valueOf().split(' ');
      switch (parsedInstruction[0].trim().toLowerCase()) {
        case 'add': { }
        case 'addi': {
          instructionSet[i] = this.createInstruction(instructionRows[i]);
          this.add(instructionSet[i]);
          this.hazardDisplay += this.displayHazard(instructionSet, i);
          break;
        }
        case 'sub': { }
        case 'subi': {
          instructionSet[i] = this.createInstruction(instructionRows[i]);
          this.sub(instructionSet[i]);
          this.hazardDisplay += this.displayHazard(instructionSet, i);
          break;
        }
        case 'sw': {
          instructionSet[i] = this.createInstruction(instructionRows[i]);
          this.store(instructionSet[i]);
          break;
        }
        case 'lw': {
          instructionSet[i] = this.createInstruction(instructionRows[i]);
          this.load(instructionSet[i]);
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

  store(instruction: Instruction) {
    (document.getElementById((instruction.input1 + instruction.input2).toString()) as HTMLInputElement).value =
      (document.getElementById(instruction.destinationRegister) as HTMLInputElement).value;
  }

  load(instruction: Instruction) {
    (document.getElementById(instruction.destinationRegister) as HTMLInputElement).value =
      (document.getElementById((instruction.input1 + instruction.input2).toString()) as HTMLInputElement).value;
  }

  displayHazard(instructionSet: Array<Instruction>, i: number): string {
    let hazards = '';
    let numInstructions = instructionSet.length <= 3 ? instructionSet.length : 3;
    const hazardTable = (document.getElementById('hazardTable') as HTMLTableElement);

    while (numInstructions > 1) {
      if (instructionSet[i].usedRegisters.includes(instructionSet[i - numInstructions + 1].destinationRegister)) {
        hazards += 'Data Hazard: Instructions ' +
          (i - numInstructions + 1) +
          ' and ' +
          i +
          ' use register ' +
          instructionSet[i - numInstructions + 1].destinationRegister +
          '. Implement Fowarding.\n';
      }
      numInstructions--;
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
