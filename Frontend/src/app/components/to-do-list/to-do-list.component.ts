import {  Component, Input, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatSort, MatSortModule} from '@angular/material/sort';
import { MatFormField, MatLabel  } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { ToDoFormComponent } from '../to-do-form/to-do-form.component';
import { PostgresService } from '../../services/postgres.service';
import { MiscService } from '../../services/misc.service';
import { categoriesInterface, conditionInterface, dialogDataInterface, taskViewInterface, threatInterface } from '../../interfaces';
import { LoadingService } from '../../services/loading.service';
import { AlertDialogData, AlertModalComponent } from '../alert-modal/alert-modal.component';

@Component({
  selector: 'app-to-do-list',
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatSortModule,
    MatFormField,
    MatLabel,
    MatInputModule
  ],
  templateUrl:'to-do-list.component.html',
  styleUrls:['to-do-list.component.scss']
})
export class ToDoListComponent implements OnInit{

  constructor(
    private matDialog:MatDialog,
    private loadingService:LoadingService,
    private psql:PostgresService,
    private misc:MiscService,
  ){
    this.psql.getColumnHeaders('task_view').subscribe(data => {
        this.taskColumns = data;
        this.taskColumns = this.misc.insertArrayAtIndex(this.taskColumns,["Options"],10)
      });
      this.psql.getAllTaskByID(1).subscribe(data => {
        this.dataSource = new MatTableDataSource<taskViewInterface>(data);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
      });
  }
  
  @Input() public taskCategories:categoriesInterface[] = [];
  @Input() public taskConditions:conditionInterface[] = [];
  @Input() public taskThreatLevels:threatInterface[] = [];
  
  public taskFormDialogRef:MatDialogRef<ToDoFormComponent>
  public taskColumns:string[] = [];
  public dataSource:MatTableDataSource<taskViewInterface>;

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  ngOnInit():void {
    try {
      this.loadingService.loadingOn();
      
    } catch (error) {
      
    } finally {
      this.loadingService.loadingOff()
    }
  }

  public updateTask(task:number):void{
    this.taskFormDialogRef = this.matDialog.open(ToDoFormComponent, {
      data: <dialogDataInterface>{ 
        allCat:this.taskCategories,
        allCond:this.taskConditions,
        allThr:this.taskThreatLevels,
        option:'update', 
        ID:task
      },
      disableClose: false,
      enterAnimationDuration:'250ms',
      exitAnimationDuration:'125ms'
    });
  }

  public applyFilter(event: Event):void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  public deleteTask(ID:number):void{
    const dialogData:AlertDialogData= {
      message: 'Do you want to proceed with this action?',
      showYesNoButtons: true
    };
    const dialogRef = this.matDialog.open(AlertModalComponent, {
      width: '350px',
      data: dialogData,
      enterAnimationDuration:'250ms',
      exitAnimationDuration:'125ms'
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('The Yes/No dialog was closed with result:', result);
      if (result) {
        console.log('User clicked Yes');
        this.psql.deleteOneTask(ID);
      } else {
        console.log('User clicked No');
        // Perform action for No
      }
    });
  }

  public finishTask(ID:number):void{
    this.psql.finishOneTask(ID);
    setTimeout(function() {
      location.reload();
    }, 1000);
  }

  public deadlineFormatHelper(deadline:string):string{
    if (deadline == null){
      return  '';
    } else {
      return deadline || deadline.trim() !== '' ? deadline.toString().slice(0,10) : '';

    }
  }
  
  public getThreatLevelCellClass(threat:string): string {
    switch (threat){
      case 'Low':
        return 'greenCell';
      case 'Medium':
        return 'yellowCell';
      case 'High':
        return 'greenCell';
      case 'Alarming':
        return 'redCell';
      case 'Inevitable':
        return 'aquaCell';
      default:
        return 'whiteCell'
    }
  }

  public getStatusColorClass(status:string): string {
    switch (status){
      case 'Unfinished':
        return 'greyCell';
      case 'In Progress':
        return 'yellowCell';
      case 'Finished':
        return 'greenCell';
      case 'Cancelled':
        return 'redCell';
      case 'Delayed':
        return 'aquaCell';
      case 'Continuous':
        return 'lightblueCell';
      case 'On Hold':
        return 'coralCell';
      case 'Speculation':
        return 'bluevioletCell';
      default:
        return 'whiteCell'
    }
  }

  public evaluateDate(row:taskViewInterface):string {
    const dateString = row.Deadline
    if (dateString == null) {
      return 'whiteRow';
    }
    
    const inputDate:Date = new Date(dateString);
    inputDate.setHours(0, 0, 0, 0);
    const today:Date = new Date();
    today.setHours(0, 0, 0, 0);
    const timeDifference:number = today.getTime() - inputDate.getTime();
    const daysDifference:number = timeDifference / (1000 * 60 * 60 * 24);
  
    if (daysDifference === 0) {
      return 'redRow';
    } else if (daysDifference >= -5 && daysDifference < 0) {
      return 'orangeRow';
    } else if (daysDifference < -5) {
      return 'greenRow';
    } else if (daysDifference >= 1) {
      return 'blackRow';
    } else {
      return 'whiteRow';
    }
  }

  public newTaskModal():void {
    this.taskFormDialogRef = this.matDialog.open(ToDoFormComponent, {
      data: <dialogDataInterface>{ 
        allCat:this.taskCategories,
        allCond:this.taskConditions,
        allThr:this.taskThreatLevels,
        option:'new', 
        ID:0 
      },
      disableClose: false,
      enterAnimationDuration:'250ms',
      exitAnimationDuration:'125ms'
    });
    this.taskFormDialogRef.afterClosed().subscribe(res => {
      if ((res == true)) {
      }
    });
  }

  public closaTaskModal():void{
    this.taskFormDialogRef.close(false)
  }

  public applyCategoryFilter(category: string):void {
    this.dataSource.filter = category.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage(); // Go to the first page after filtering
    }
  }
}
