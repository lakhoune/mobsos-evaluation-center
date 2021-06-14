import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';

import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import {
  disableEdit,
  setService,
  switchWorkspace,
  toggleEdit,
} from '../services/store.actions';

import { cloneDeep } from 'lodash';
import { User, UserRole, Visitor } from '../models/user.model';
import { FormControl } from '@angular/forms';
import {
  ALL_WORKSPACES_FOR_SELECTED_SERVICE_EXCEPT_ACTIVE,
  VISITORS_EXCEPT_USER,
  EDIT_MODE,
  IS_MEMBER_OF_SELECTED_GROUP,
  MEASURE_CATALOG,
  ROLE_IN_CURRENT_WORKSPACE,
  SELECTED_GROUP,
  SELECTED_SERVICE,
  SERVICES,
  SUCCESS_MODEL,
  USER,
  USER_IS_OWNER_IN_CURRENT_WORKSPACE,
  WORKSPACE_INITIALIZED,
  VISITORS,
  APPLICATION_WORKSPACE,
} from '../services/store.selectors';
import { combineLatest, Subscription } from 'rxjs';
import { filter, map, withLatestFrom } from 'rxjs/operators';
import { WorkspaceService } from '../services/workspace.service';
import { SuccessModel } from '../models/success.model';
import { MeasureCatalog } from '../models/measure.catalog';
import { ServiceInformation } from '../models/service.model';
import {
  ApplicationWorkspace,
  CommunityWorkspace,
} from '../models/workspace.model';
import { NGXLogger } from 'ngx-logger';

@Component({
  selector: 'app-workspace-management',
  templateUrl: './workspace-management.component.html',
  styleUrls: ['./workspace-management.component.scss'],
})
export class WorkspaceManagementComponent
  implements OnInit, OnDestroy
{
  communityWorkspace: CommunityWorkspace = {};
  workspaceUser: string;
  numberOfRequirements = 0;
  successModel$ = this.ngrxStore.select(SUCCESS_MODEL);
  successModel: SuccessModel;
  measureCatalog$ = this.ngrxStore.select(MEASURE_CATALOG);
  workspacesForServiceExceptActive$ = this.ngrxStore.select(
    ALL_WORKSPACES_FOR_SELECTED_SERVICE_EXCEPT_ACTIVE,
  );
  visitorsExcpetUser$ = this.ngrxStore.select(VISITORS_EXCEPT_USER);
  visitors$ = this.ngrxStore.select(VISITORS);
  visitors: Visitor[] = [];
  currentApplicationWorkspace$ = this.ngrxStore.select(
    APPLICATION_WORKSPACE,
  );
  currentApplicationWorkspace: ApplicationWorkspace;
  measureCatalog: MeasureCatalog;
  serviceSelectForm = new FormControl('');
  selectedService: ServiceInformation;
  selectedServiceName: string;
  services$ = this.ngrxStore.select(SERVICES);
  editMode$ = this.ngrxStore.select(EDIT_MODE);
  roleInWorkspace$ = this.ngrxStore.select(ROLE_IN_CURRENT_WORKSPACE);
  userIsOwner$ = this.ngrxStore.select(
    USER_IS_OWNER_IN_CURRENT_WORKSPACE,
  );
  user$ = this.ngrxStore.select(USER);
  user: User;
  memberOfGroup$ = this.ngrxStore.select(IS_MEMBER_OF_SELECTED_GROUP);
  workspaceInitialized$ = this.ngrxStore.select(
    WORKSPACE_INITIALIZED,
  );
  selectedService$ = this.ngrxStore.select(SELECTED_SERVICE);
  selectedGroup$ = this.ngrxStore.select(SELECTED_GROUP);
  showEditButton$ = combineLatest([
    this.selectedGroup$,
    this.selectedService$,
    this.workspaceInitialized$,
  ]).pipe(
    map(([group, service, init]) => !!group && !!service && init),
  );

  subscriptions$: Subscription[] = [];
  constructor(
    private dialog: MatDialog,
    private translate: TranslateService,
    private workspaceService: WorkspaceService,
    private ngrxStore: Store,
    private logger: NGXLogger,
  ) {}

  ngOnInit(): void {
    const subscription = this.selectedService$
      .pipe(filter((service) => service !== undefined))
      .subscribe((service) => {
        this.selectedServiceName = service.name;
        // this is used so that the initial success model is fetched. We should rather use a new effect for this
        this.serviceSelectForm.setValue(
          service.alias ? service.alias : this.selectedServiceName,
        ); // set the value in the selection
      });
    this.subscriptions$.push(subscription);
    let sub = this.editMode$
      .pipe(withLatestFrom(this.selectedGroup$))
      .subscribe(async ([editMode, group]) => {
        if (editMode) {
          const ctx = this;
          await this.initWorkspace(group.id);
          ctx.switchWorkspace(ctx.getMyUsername());
        }
      });
    this.subscriptions$.push(sub);
    sub = this.successModel$.subscribe((successModel) => {
      this.successModel = successModel;
    });
    this.subscriptions$.push(sub);
    sub = this.measureCatalog$.subscribe((measureCatalog) => {
      this.measureCatalog = measureCatalog;
    });
    this.subscriptions$.push(sub);
    sub = this.user$.subscribe((user) => {
      this.user = user;
    });
    this.subscriptions$.push(sub);
    sub = this.visitors$.subscribe((visitors) => {
      this.visitors = visitors;
    });
    this.subscriptions$.push(sub);
    sub = this.currentApplicationWorkspace$.subscribe(
      (currentApplicationWorkspace) => {
        this.currentApplicationWorkspace = cloneDeep(
          currentApplicationWorkspace,
        );
      },
    );
    this.subscriptions$.push(sub);
  }

  setWorkspaceUser(user: string) {
    this.workspaceUser = user;
  }

  setWorkspace(workspace: CommunityWorkspace) {
    this.communityWorkspace = cloneDeep(workspace);
  }

  /**
   * Initializes the workspace for collaborative success modeling
   */
  private async initWorkspace(groupID: string) {
    const ctx = this;
    const currentCommunityWorkspace =
      this.workspaceService.getCurrentCommunityWorkspace(groupID);
    this.communityWorkspace = cloneDeep(currentCommunityWorkspace);

    const myUsername = ctx.getMyUsername();
    ctx.setWorkspaceUser(myUsername);
    if (!Object.keys(ctx.communityWorkspace).includes(myUsername)) {
      ctx.communityWorkspace[myUsername] = {};
    }
    const userWorkspace = ctx.communityWorkspace[myUsername];
    if (
      !Object.keys(userWorkspace).includes(ctx.selectedServiceName)
    ) {
      if (!ctx.measureCatalog) {
        ctx.measureCatalog = new MeasureCatalog({});
      }
      if (!ctx.successModel) {
        ctx.successModel = SuccessModel.emptySuccessModel(
          ctx.selectedService,
        );
      }
      userWorkspace[this.selectedServiceName] = {
        createdAt: new Date().toISOString(),
        createdBy: myUsername,
        visitors: [],
        catalog: this.measureCatalog,
        model: this.successModel,
      };
    }
    ctx.persistWorkspaceChanges();
    await this.workspaceService.waitUntilWorkspaceIsSynchronized();
    return true;
  }

  onServiceSelected(service: ServiceInformation) {
    this.ngrxStore.dispatch(disableEdit());
    this.ngrxStore.dispatch(setService({ service }));
  }

  onEditModeChanged() {
    this.ngrxStore.dispatch(toggleEdit());
  }

  switchWorkspace(user: string) {
    if (!user) {
      return;
    }

    if (!this.communityWorkspace[user]) return;
    this.currentApplicationWorkspace =
      this.communityWorkspace[user][this.selectedServiceName];
    if (!this.currentApplicationWorkspace) return;
    this.workspaceUser = user;

    const visitors = this.currentApplicationWorkspace.visitors;
    const myUsername = this.getMyUsername();

    const containedInVisitors = visitors.find(
      (visitor) => visitor.username === myUsername,
    );
    // we add ourselves as spectators  if we are not a visitor yet
    if (this.workspaceUser !== myUsername && !containedInVisitors) {
      visitors.push({
        username: myUsername,
        role: UserRole.SPECTATOR,
      });
      visitors.sort((a, b) => (a.username > b.username ? 1 : -1));
      this.currentApplicationWorkspace.visitors = visitors;

      const service = this.currentApplicationWorkspace.model.service;
      this.communityWorkspace = cloneDeep(this.communityWorkspace); // need to clone to assign
      this.communityWorkspace[user][service].visitors = visitors; // update the communityWorkspace
      this.persistWorkspaceChanges();
    }
    this.ngrxStore.dispatch(switchWorkspace({ username: user }));
  }

  private persistWorkspaceChanges() {
    this.workspaceService.setCommunityWorkspace(
      this.communityWorkspace,
    );
  }

  changeVisitorRole(visitorName: string, role?: string) {
    console.log(role, UserRole[role], visitorName);
    this.communityWorkspace = cloneDeep(this.communityWorkspace);
    const visitors = this.communityWorkspace[this.workspaceUser][
      this.selectedServiceName
    ].visitors.map((visitor) =>
      visitor.username === visitorName
        ? {
            ...visitor,
            role:
              role === 'editor'
                ? UserRole.EDITOR
                : UserRole.SPECTATOR,
          }
        : visitor,
    );
    this.communityWorkspace[this.workspaceUser][
      this.selectedServiceName
    ].visitors = visitors;
    console.log(this.communityWorkspace);
    this.persistWorkspaceChanges();
  }

  async openCopyWorkspaceDialog(owner: string) {
    const message = await this.translate
      .get('success-modeling.copy-workspace-prompt')
      .toPromise();
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      minWidth: 300,
      data: message,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.copyWorkspace(owner);
      }
    });
  }
  private getMyUsername() {
    if (!this.user) {
      return null;
    }
    return this.user.profile.preferred_username;
  }

  private async openClearWorkspaceDialog() {
    // only open this dialog if a user is logged in, because else the user's workspace should not be removed anyway
    if (this.user) {
      const message = await this.translate
        .get('success-modeling.discard-changes-prompt')
        .toPromise();
      const dialogRef = this.dialog.open(
        ConfirmationDialogComponent,
        {
          minWidth: 300,
          data: message,
        },
      );
      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.removeWorkspace();
        }
      });
    }
  }

  private getWorkspaceByUserAndService(
    user: string,
    service: string,
  ): ApplicationWorkspace {
    this.communityWorkspace = cloneDeep(this.communityWorkspace);
    if (!this.communityWorkspace) {
      return;
    }
    if (!Object.keys(this.communityWorkspace).includes(user)) {
      return null;
    }
    const userWorkspace = this.communityWorkspace[user];
    if (!Object.keys(userWorkspace).includes(service)) {
      return null;
    }
    return userWorkspace[service];
  }

  private removeWorkspace() {
    const myUsername = this.user.profile.preferred_username;
    this.communityWorkspace = cloneDeep(this.communityWorkspace);
    if (!Object.keys(this.communityWorkspace).includes(myUsername)) {
      return;
    }
    const userWorkspace = this.communityWorkspace[myUsername];
    if (
      !Object.keys(userWorkspace).includes(this.selectedServiceName)
    ) {
      return;
    }
    delete userWorkspace[this.selectedServiceName];
    this.persistWorkspaceChanges();
  }

  private copyWorkspace(owner: string) {
    const myUsername = this.getMyUsername();
    if (!Object.keys(this.communityWorkspace).includes(myUsername)) {
      return;
    }
    const myWorkspace = this.getWorkspaceByUserAndService(
      myUsername,
      this.selectedServiceName,
    );
    const ownerWorkspace = this.getWorkspaceByUserAndService(
      owner,
      this.selectedServiceName,
    );
    if (!myWorkspace || !ownerWorkspace) {
      return;
    }
    myWorkspace.catalog = cloneDeep(ownerWorkspace.catalog);
    myWorkspace.model = cloneDeep(ownerWorkspace.model);
    this.communityWorkspace[myUsername][this.selectedServiceName] =
      myWorkspace;
    this.persistWorkspaceChanges();
  }

  ngOnDestroy() {
    this.subscriptions$.forEach((subscription) => {
      subscription.unsubscribe();
    });
    this.workspaceService.removeWorkspace(
      this.getMyUsername(),
      this.selectedServiceName,
    );
  }
}
