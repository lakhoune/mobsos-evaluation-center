import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';

import { PickReqbazProjectComponent } from './pick-reqbaz-project/pick-reqbaz-project.component';
import { ConfirmationDialogComponent } from '../../confirmation-dialog/confirmation-dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../../../environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { _USER } from 'src/app/services/store.selectors';
import {
  addReqBazarProject,
  removeReqBazarProject,
  setNumberOfRequirements,
  storeRequirements,
  storeSuccessModel,
} from 'src/app/services/store.actions';
import { User } from 'src/app/models/user.model';
import { SuccessModel } from 'src/app/models/success.model';
import {
  ReqbazProject,
  Requirement,
} from 'src/app/models/reqbaz.model';
import { Las2peerService } from 'src/app/services/las2peer.service';
import { cloneDeep } from 'lodash-es';
@Component({
  selector: 'app-requirements-list',
  templateUrl: './requirements-list.component.html',
  styleUrls: ['./requirements-list.component.scss'],
})
export class RequirementsListComponent
  implements OnInit, OnChanges, OnDestroy
{
  @Input() successModel: SuccessModel;

  @Output() numberOfRequirements = new EventEmitter<number>();

  user$ = this.ngrxStore.select(_USER);
  requirements: Requirement[];
  refreshRequirementsHandle;
  frontendUrl = environment.reqBazFrontendUrl;
  openedRequirement = null;
  private user: User;
  private subscriptions$ = [];

  constructor(
    private dialog: MatDialog,
    private translate: TranslateService,
    private las2peer: Las2peerService,
    private ngrxStore: Store,
  ) {}

  static joinAbsoluteUrlPath(...args) {
    return args
      .map((pathPart) => {
        if (typeof pathPart === 'number') {
          pathPart = pathPart.toString();
        }
        return pathPart.replace(/(^\/|\/$)/g, '');
      })
      .join('/');
  }

  ngOnInit() {
    const sub = this.user$.subscribe((user) => (this.user = user));
    this.subscriptions$.push(sub);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (Object.keys(changes).includes('successModel')) {
      this.refreshRequirements();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions$.forEach((sub) => sub.unsubscribe());
  }

  openPickProjectDialog() {
    const dialogRef = this.dialog.open(PickReqbazProjectComponent, {
      minWidth: 300,
      width: '80%',
    });
    const sub = dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.successModel = SuccessModel.fromPlainObject(
          cloneDeep(this.successModel),
        );
        this.successModel.reqBazProject = new ReqbazProject(
          result.selectedProject.name,
          result.selectedProject.id,
          result.selectedCategory.id,
        );
        this.ngrxStore.dispatch(
          addReqBazarProject({
            project: this.successModel.reqBazProject,
          }),
        );

        this.ngrxStore.dispatch(
          storeSuccessModel({
            xml: this.successModel.toXml().outerHTML,
          }),
        );
      }
    });
    this.subscriptions$.push(sub);
  }

  async openDisconnectProjectDialog() {
    const message = await this.translate
      .get(
        'success-modeling.requirements-list.disconnect-project-prompt',
      )
      .toPromise();
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      minWidth: 300,
      data: message,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.successModel = SuccessModel.fromPlainObject(
          cloneDeep(this.successModel),
        );
        const id = this.successModel.reqBazProject.id;
        this.ngrxStore.dispatch(
          removeReqBazarProject({
            id,
          }),
        );

        this.successModel.reqBazProject = null;
        this.ngrxStore.dispatch(
          storeSuccessModel({
            xml: this.successModel.toXml().outerHTML,
          }),
        );
        this.ngrxStore.dispatch(
          storeRequirements({ requirements: undefined }),
        );
        this.ngrxStore.dispatch(setNumberOfRequirements({ n: 0 }));
        this.numberOfRequirements.emit(0);
      }
    });
  }

  refreshRequirements() {
    if (!this.successModel || !this.successModel.reqBazProject) {
      this.requirements = [];
      return;
    }
    this.las2peer
      .fetchRequirementsOnReqBaz(
        this.successModel.reqBazProject.categoryId,
      )
      .then((requirements) => {
        this.requirements = cloneDeep(requirements) as [];
        this.ngrxStore.dispatch(
          storeRequirements({ requirements: this.requirements }),
        );
        this.ngrxStore.dispatch(
          setNumberOfRequirements({
            n: (requirements as [])?.length,
          }),
        );

        this.numberOfRequirements.emit((requirements as []).length);
      });
  }

  isRealized(requirement) {
    return Object.keys(requirement).includes('realized');
  }

  isLead(requirement) {
    return (
      Object.keys(requirement).includes('leadDeveloper') &&
      this.user &&
      requirement.leadDeveloper.userName ===
        this.user?.profile.preferred_username
    );
  }

  async realizeRequirement(requirement: Requirement) {
    await this.las2peer.realizeRequirementOnReqBaz(requirement.id);

    let newRequirement = this.requirements.find(
      (req) => req.id === requirement.id,
    );
    newRequirement = cloneDeep(newRequirement);
    newRequirement.realized = new Date();
    this.requirements = this.requirements.map((req) =>
      req.id === newRequirement.id ? newRequirement : req,
    );
    setTimeout(() => {
      this.refreshRequirements();
    }, 1000);
  }

  async unrealizeRequirement(requirement: Requirement) {
    await this.las2peer.unrealizeRequirementOnReqBaz(requirement.id);
    let newRequirement = this.requirements.find(
      (req) => req.id === requirement.id,
    );
    newRequirement = cloneDeep(newRequirement);
    newRequirement.realized = undefined;
    this.requirements = this.requirements.map((req) =>
      req.id === newRequirement.id ? newRequirement : req,
    );
    setTimeout(() => {
      this.refreshRequirements();
    }, 1000);
  }

  becomeLeaddevRequirement(requirement: any) {
    this.las2peer.becomeLeaddeveloperOnReqBaz(requirement.id);
    this.refreshRequirements();
  }

  stopBeingLeaddevRequirement(requirement: any) {
    this.las2peer.stopBeingLeaddeveloperOnReqBaz(requirement.id);
    this.refreshRequirements();
  }

  getFrontendUrlForRequirement(requirement: any) {
    const reqBazProject: ReqbazProject =
      this.successModel.reqBazProject;
    if (!reqBazProject) {
      return '';
    }
    return RequirementsListComponent.joinAbsoluteUrlPath(
      environment.reqBazFrontendUrl,
      'projects',
      reqBazProject.id,
      'categories',
      reqBazProject.categoryId,
      'requirements',
      requirement.id,
    );
  }
}
