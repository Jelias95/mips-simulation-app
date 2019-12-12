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

  constructor() { }

  ngOnInit() {
    this.registers = ['$zero', '$at', '$v0', '$v1', '$a0', '$a1', '$a2', '$a3', '$t0', '$t1', '$t2', '$t3', '$t4', '$t5', '$t6', '$t7', '$s0', '$s1', '$s2', '$s3', '$s4', '$s5', '$s6', '$s7', '$t8', '$t9', '$k0', '$k1', '$gp', '$sp', '$fp', '$ra'];

    this.memory = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
  }

  submitInstructionSet() {
    (document.getElementById('$zero') as HTMLInputElement).value = '0';
    this.clearPage();
    const instructionRows: Array<string> = (document.getElementById('instructionList') as HTMLInputElement).value.split('\n');
    this.executeInstructionSet(instructionRows);
  }

  clearPage() {
    (document.getElementById('hazardList') as HTMLInputElement).value = '';
    const numRows = (document.getElementById('timingDiagram') as HTMLTableElement).rows;
    while (numRows.length !== 0) {
      (document.getElementById('timingDiagram') as HTMLTableElement).deleteRow(0);
    }
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
    let hazardList = '';
    for (let i = 0; i < instructionRows.length; i++) {
      const parsedInstruction = instructionRows[i].valueOf().split(' ');
      switch (parsedInstruction[0].trim().toLowerCase()) {
        case 'add': { }
        case 'addi': {
          instructionSet[i] = this.createInstruction(instructionRows[i]);
          this.add(instructionSet[i]);
          hazardList += this.displayHazard(instructionSet, i);
          break;
        }
        case 'sub': { }
        case 'subi': {
          instructionSet[i] = this.createInstruction(instructionRows[i]);
          this.sub(instructionSet[i]);
          hazardList += this.displayHazard(instructionSet, i);
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
    hazardList.length > 0 ?
      (document.getElementById('hazardList') as HTMLInputElement).value = hazardList
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
    let numInstructions = instructionSet.length <= 4 ? instructionSet.length : 4;

    while (numInstructions > 1) {
      if (instructionSet[i].usedRegisters.includes(instructionSet[i - numInstructions + 1].destinationRegister)) {
        if (numInstructions === 4) {
          hazards += 'Data Hazard: Instructions ' +
          (i - numInstructions + 2) +
          ' and ' +
          (i + 1) +
          ' use register ' +
          instructionSet[i - numInstructions + 1].destinationRegister +
          '. Implement write 1st half, read 2nd half of cycle.\n';
        } else {
        hazards += 'Data Hazard: Instructions ' +
          (i - numInstructions + 2) +
          ' and ' +
          (i + 1) +
          ' use register ' +
          instructionSet[i - numInstructions + 1].destinationRegister +
          '. Implement fowarding.\n';
        }
      }
      numInstructions--;
    }
    this.noStall(i);
    return hazards;
  }

  noStall(i: number) {
    const timingDiagram = (document.getElementById('timingDiagram') as HTMLTableElement);
    const newRow = timingDiagram.insertRow(i);

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
