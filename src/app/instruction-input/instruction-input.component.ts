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
  stallNeeded: boolean;
  hazardList = '';

  constructor() { }

  ngOnInit() {
    this.stallNeeded = false;
    this.registers = ['$zero', '$at', '$v0', '$v1', '$a0', '$a1', '$a2', '$a3', '$t0', '$t1', '$t2', '$t3', '$t4', '$t5', '$t6', '$t7', '$s0', '$s1', '$s2', '$s3', '$s4', '$s5', '$s6', '$s7', '$t8', '$t9', '$k0', '$k1', '$gp', '$sp', '$fp', '$ra'];
    this.memory = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
  }

  submitInstructionSet() {
    this.clearPage();
    const instructionRows: Array<string> = (document.getElementById('instructionList') as HTMLInputElement).value.split('\n');
    this.executeInstructionSet(instructionRows);
  }

  clearPage() {
    (document.getElementById('hazardList') as HTMLInputElement).value = '';
    this.hazardList = '';
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
      case 'addi': {
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
    for (let i = 0; i < instructionRows.length; i++) {
      const parsedInstruction = instructionRows[i].valueOf().split(' ');
      switch (parsedInstruction[0].trim().toLowerCase()) {
        case 'add': { }
        case 'addi': {
          instructionSet[i] = this.createInstruction(instructionRows[i]);
          this.add(instructionSet[i]);
          this.displayHazard(instructionSet, i);
          break;
        }
        case 'sub': {
          instructionSet[i] = this.createInstruction(instructionRows[i]);
          this.sub(instructionSet[i]);
          this.displayHazard(instructionSet, i);
          break;
        }
        case 'sw': {
          instructionSet[i] = this.createInstruction(instructionRows[i]);
          this.store(instructionSet[i]);
          this.displayHazard(instructionSet, i);
          break;
        }
        case 'lw': {
          instructionSet[i] = this.createInstruction(instructionRows[i]);
          this.load(instructionSet[i]);
          this.displayHazard(instructionSet, i);
          break;
        }
        default: {
          console.log('OOPS! Unable to find command!');
          break;
        }
      }
    }
    this.hazardList.length > 0 ?
      (document.getElementById('hazardList') as HTMLInputElement).value = this.hazardList
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

  displayHazard(instructionSet: Array<Instruction>, i: number) {
    let numInstructions = instructionSet.length <= 4 ? instructionSet.length : 4;
    let loadHazard = false;
    let structuralHazard = false;

    if (numInstructions > 3) {
      if (instructionSet[i - 3].command === 'lw' || instructionSet[i - 3].command === 'sw') {
        this.hazardList += 'Structural Hazard: Instructions ' +
          (i + 1) +
          ' and ' +
          (i - 2) +
          ' access memory at the same time. Add CPU hardware.\n';
        structuralHazard = true;
      }
    }

    while (numInstructions > 1) {
      if (instructionSet[i].usedRegisters.includes(instructionSet[i - numInstructions + 1].destinationRegister)) {
        if (instructionSet[i - numInstructions + 1].command === 'lw') {
          if (i - (i - numInstructions + 1) === 1) {
            this.hazardList += 'Data Load Hazard: Instructions ' +
              (i + 1) +
              ' and ' +
              (i - numInstructions + 2) +
              ' use register ' +
              instructionSet[i - numInstructions + 1].destinationRegister +
              '. Implement pipeline interlock.\n';
            loadHazard = true;
          }
        } else if (numInstructions === 4) {
          this.hazardList += 'Data Hazard: Instructions ' +
            (i + 1) +
            ' and ' +
            (i - numInstructions + 2) +
            ' use register ' +
            instructionSet[i - numInstructions + 1].destinationRegister +
            '. Implement write 1st half, read 2nd half of cycle.\n';
        } else {
          this.hazardList += 'Data Hazard: Instructions ' +
            (i + 1) +
            ' and ' +
            (i - numInstructions + 2) +
            ' use register ' +
            instructionSet[i - numInstructions + 1].destinationRegister +
            '. Implement fowarding.\n';
        }
      }
      numInstructions--;
    }
    loadHazard ? this.solveLoadHazard(i, instructionSet) : this.basicTiming(i);
  }

  addCell(row: HTMLTableRowElement, cell: number, node: string, currentInstruction: number): number {
    let cellOffset = cell;
    let newCell: HTMLTableDataCellElement;
    let newText: Text;

    if (currentInstruction > 0) {
      if (cellOffset < (document.getElementById('timingDiagram') as HTMLTableElement).rows[currentInstruction - 1].cells.length) {
        if ((document.getElementById('timingDiagram') as HTMLTableElement).rows[currentInstruction - 1].cells[cellOffset].innerText === node && node !== '') {
          newCell = row.insertCell(cellOffset);
          newText = document.createTextNode('stall');
          newCell.appendChild(newText);
          cellOffset++;
          this.hazardList += 'Structural Hazard: Instructions ' +
            (currentInstruction + 1) +
            ' and ' +
            (currentInstruction) +
            ' attempt ' +
            node +
            ' at the same time. Add Stall.\n';
        }
        if ((document.getElementById('timingDiagram') as HTMLTableElement).rows[currentInstruction - 1].cells[cellOffset].innerText === 'stall') {
          newCell = row.insertCell(cellOffset);
          newText = document.createTextNode('stall');
          newCell.appendChild(newText);
          cellOffset++;
          this.hazardList += 'Structural Hazard: Instructions ' +
            (currentInstruction + 1) +
            ' and ' +
            (currentInstruction) +
            ' attempt ' +
            node +
            ' at the same time. Add Stall.\n';
        }
      }
    }
    newCell = row.insertCell(cellOffset);
    newText = document.createTextNode(node);
    newCell.appendChild(newText);

    cellOffset++;
    return cellOffset;
  }

  addBlankCell(row: HTMLTableRowElement, cell: number): number {
    let cellOffset = cell;
    const newCell = row.insertCell(cellOffset);
    const newText = document.createTextNode('');
    newCell.appendChild(newText);
    cellOffset++;
    return cellOffset;

  }

  basicTiming(i: number) {
    const timingDiagram = (document.getElementById('timingDiagram') as HTMLTableElement);
    const newRow = timingDiagram.insertRow(i);
    let cellToWrite = 0;

    for (let j = 0; j < i; j++) {
      cellToWrite = this.addBlankCell(newRow, cellToWrite);
    }
    cellToWrite = this.addCell(newRow, cellToWrite, 'IF', i);
    cellToWrite = this.addCell(newRow, cellToWrite, 'ID', i);
    cellToWrite = this.addCell(newRow, cellToWrite, 'EX', i);
    cellToWrite = this.addCell(newRow, cellToWrite, 'M', i);
    cellToWrite = this.addCell(newRow, cellToWrite, 'W', i);
  }

  solveLoadHazard(i: number, instructionSet: Array<Instruction>) {
    let numInstructions = instructionSet.length <= 4 ? instructionSet.length : 4;
    const timingDiagram = (document.getElementById('timingDiagram') as HTMLTableElement);
    const newRow = timingDiagram.insertRow(i);
    let cellToWrite = 0;

    for (let j = 0; j < i; j++) {
      cellToWrite = this.addBlankCell(newRow, cellToWrite);
    }
    while (numInstructions > 1) {
      if (instructionSet[i - numInstructions + 1].command === 'lw') {
        if (i - (i - numInstructions + 1) === 1) {
          cellToWrite = this.addCell(newRow, cellToWrite, 'IF', i);
          cellToWrite = this.addCell(newRow, cellToWrite, 'ID', i);
          cellToWrite = this.addCell(newRow, cellToWrite, 'stall', i);
        }
      }
      numInstructions--;
    }

    cellToWrite = this.addCell(newRow, cellToWrite, 'EX', i);
    cellToWrite = this.addCell(newRow, cellToWrite, 'M', i);
    cellToWrite = this.addCell(newRow, cellToWrite, 'W', i);
  }
}
