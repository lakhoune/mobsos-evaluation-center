import { Component, Input, OnInit } from '@angular/core';
import { BaseVisualizationComponent } from '../visualization.component';
import { MatDialog } from '@angular/material/dialog';
import { ServiceInformation } from 'src/app/store.service';
import { Store } from '@ngrx/store';
import {
  MEASURE,
  VISUALIZATION_DATA_FOR_QUERY,
} from 'src/app/services/store.selectors';
import { filter } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Measure } from 'src/app/models/measure.model';
import { ChartVisualization } from 'src/app/models/visualization.model';
import { GoogleChart } from 'src/app/models/chart.model';

@Component({
  selector: 'app-chart-visualization',
  templateUrl: './chart-visualization.component.html',
  styleUrls: ['./chart-visualization.component.scss'],
})
export class ChartVisualizerComponent
  extends BaseVisualizationComponent
  implements OnInit
{
  @Input() measureName: string;
  @Input() service: ServiceInformation;

  data$: Observable<any[][]>;
  measure$: Observable<Measure>;
  query: string; //local copy of the sql query
  chart: GoogleChart; 

  constructor(protected dialog: MatDialog, protected ngrxStore: Store) {
    super(ngrxStore, dialog);
  }

  ngOnInit() {
    if (this.service){ 
    this.measure$ = this.ngrxStore
      .select(MEASURE, this.measureName) //selects the measure from the measure catalog
      .pipe(filter((data) => !!data));

    this.measure$
      .subscribe((measure: Measure) => {
        const visualization = measure.visualization as ChartVisualization;
        let query = measure.queries[0].sql;
        const queryParams = this.getParamsForQuery(query);
        
        query = this.applyVariableReplacements(query, this.service);
        query =
          BaseVisualizationComponent.applyCompatibilityFixForVisualizationService(
            query
          );

        if (this.query !== query) {
          this.chart == null;
          this.visualizationInitialized = false;
          this.query = query;
          super.fetchVisualizationData(query, queryParams);
          this.data$ = this.ngrxStore.select(
            VISUALIZATION_DATA_FOR_QUERY,
            query
          );
          this.data$.pipe(filter((data) => !!data)).subscribe((data) => {
            const dataTable = data;
            if (dataTable instanceof Array && dataTable.length >= 2) {
              let labelTypes = dataTable[1];
              const rows = dataTable.slice(2) as any[][];
              this.chart = new GoogleChart(
                '',
                visualization.chartType,
                rows,
                dataTable[0],
                {
                  colors: [
                    '#00a895',
                    '#9500a8',
                    '#a89500',
                    '#ff5252',
                    '#ffd600',
                  ],
                  animation: { startup: true },
                }
              );
              if (this.chart) this.visualizationInitialized = true;
            }
          });
        }
      });}
  }
}
