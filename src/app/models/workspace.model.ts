import { MeasureCatalog } from 'src/success-model/measure-catalog';
import { SuccessModel } from 'src/success-model/success-model';
import { Visitor } from 'typescript';

export interface ApplicationWorkspace {
  createdAt: string;
  createdBy: string;
  visitors: Visitor[];
  model: SuccessModel;
  catalog: MeasureCatalog;
}

export interface UserWorkspace {
  // service name is key
  [key: string]: ApplicationWorkspace;
}

export interface CommunityWorkspace {
  // user ID is key
  [key: string]: UserWorkspace;
}
