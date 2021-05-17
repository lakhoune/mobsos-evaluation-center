import { Questionnaire } from '../las2peer.service';
import {
  GroupCollection,
  GroupInformation,
  ServiceCollection,
  ServiceInformation,
} from '../store.service';
import { VisualizationData } from './visualization.model';

/**
 * state of the app
 */
export interface AppState {
  services: ServiceCollection;
  groups: GroupCollection;
  user: object;
  selectedGroup: GroupInformation;
  selectedGroupId: string;
  selectedServiceName: string;
  selectedService: ServiceInformation;
  editMode: boolean;
  questionnaires: Questionnaire[];
  messageDescriptions: object;
  visualizationData: VisualizationData;
  successModelXML: string;
  measureCatalogXML: string;
  currentNumberOfHttpCalls: number;
  expertMode: boolean;
}
/**
 * What the store looks like
 */
export interface StoreState {
  Reducer: AppState;
}
