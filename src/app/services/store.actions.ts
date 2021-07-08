import { createAction, props } from '@ngrx/store';
import { GroupInformation } from '../models/community.model';

import { Measure } from '../models/measure.model';
import { ReqbazProject, Requirement } from '../models/reqbaz.model';
import { ServiceInformation } from '../models/service.model';
import { SuccessFactor } from '../models/success.model';
import { User, UserRole } from '../models/user.model';
import { CommunityWorkspace } from '../models/workspace.model';

export enum HttpActions {
  FETCH_SERVICES = 'Fetch services from the network',
  FETCH_GROUPS = 'fetch groups from the network',
  FETCH_SERVICE_MESSAGE_DESCRIPTION = 'fetch service descriptions for a service from the network ',
  FETCH_MEASURE_CATALOG_FOR_GROUP = 'fetch measure catalog for current Group',
  FETCH_SUCCESS_MODEL_FOR_GROUP_AND_SERVICE = 'fetch success model for current Group and current service',
  FETCH_VISUALIZATION_DATA = 'fetch visualization data from the qvs for a given sql query',
  SAVE_MODEL_AND_CATALOG = 'send an update to the server for both model and catalog',
  SAVE_CATALOG = 'save catalog on the server',
  SAVE_MODEL = 'save model on the server',
  SAVE_CATALOG_SUCCESS = 'successfully saved the catalog on the server',
  ADD_GROUP = 'adds a new group',
}

export enum StoreActions {
  STORE_SERVICE_MESSAGE_DESCRIPTION = 'store the service descriptions for a service from the network',
  STORE_SERVICES = 'store services',
  STORE_GROUPS = 'store groups',
  STORE_USER = 'Store the user',
  STORE_GROUP = 'Stores a new group in state',
  STORE_USERNAME = 'Set the username. Called for anonymous users',
  STORE_MEASURE_CATALOG = 'Store the measure catalog as xml string',
  STORE_SUCCESS_MODEL = 'Store the success model as xml string',
  STORE_VISUALIZATION_DATA = 'Store visualization data from the qvs',
  UPDATE_COMMUNITY_WORKSPACE = 'updates the current application workspace',
  ADD_FACTOR_TO_DIMENSION = 'add a factor to a success dimension',
  REMOVE_FACTOR_FROM_DIMENSION = 'remove a factor from a success dimension',
  REMOVE_MEASURE_FROM_FACTOR = 'remove a measure from a success factor',
  EDIT_FACTOR_IN_DIMENSION = 'updates a specific factor for a dimension',
  ADD_MEASURE_TO_CATALOG = 'adds a measure to the catalog',
  ADD_MEASURE_TO_SUCCESS_FACTOR = 'adds a measure to the success model',
  EDIT_MEASURE = 'updates an existing measure in catalog and success model',
  EDIT_MEASURE_IN_CATALOG = 'updates an existing measure in catalog only ',
  SET_COMMUNITY_WORKSPACE = 'update the community workspace',
  SET_COMMUNITY_WORKSPACE_OWNER = 'set the selected community workspace owner',
  REMOVE_VISUALIZATION_DATA = ' Removes visualization data for a given query',
  ADD_REQUIREMENTS_BAZAR_PROJECT = 'add a requirement bazar project to the success model',
  REMOVE_REQUIREMENTS_BAZAR_PROJECT = 'remove a requirement bazar project from the success model',
  STORE_REQUIREMENTS = 'Store the requirements for the current req bazar project',
  SET_NUMBER_OF_REQUIREMENTS = 'set the number of requirements for the current project',
}

export enum StateActions {
  SET_GROUP = 'set current group',
  TRANSFER_MISSING_GROUPS_TO_MOBSOS = 'transfer groups from the contact service which are not known to mobsos to mobsos',
  SET_SERVICE = 'set the current service',
  SET_SERVICE_NAME = 'set the current service by only providing  the name',
  JOIN_WORKSPACE = 'Join the workspace of another user',
  TOGGLE_EDIT = 'toggle edit mode for success model',
  ENABLE_EDIT = 'enable edit mode for success model',
  DISABLE_EDIT = 'disable edit mode for success model',
  INCREMENT_LOADING = 'Increase the number of current http calls',
  DECREMENT_LOADING = 'Decrease the number of current http calls',
  TOGGLE_EXPERT_MODE = 'Toggle the expert mode for raw edit of success model and measure catalog',
  INITIALIZE_STATE = 'Initializes the state of the application. This action should only be called once.',

  SUCCESS_RESPONSE = 'response was successfully',
  FAILURE_RESPONSE = 'response was not successfully',
}

// fetching
export const fetchServices = createAction(HttpActions.FETCH_SERVICES);
export const fetchGroups = createAction(HttpActions.FETCH_GROUPS);
export const fetchVisualizationData = createAction(
  HttpActions.FETCH_VISUALIZATION_DATA,
  props<{ query: string; queryParams: string[] }>(),
);
export const fetchMeasureCatalog = createAction(
  HttpActions.FETCH_MEASURE_CATALOG_FOR_GROUP,
  props<{ groupId: string }>(),
);
export const fetchSuccessModel = createAction(
  HttpActions.FETCH_SUCCESS_MODEL_FOR_GROUP_AND_SERVICE,
  props<{ groupId; serviceName }>(),
);

// storing
export const storeServices = createAction(
  StoreActions.STORE_SERVICES,
  props<{ servicesFromL2P; servicesFromMobSOS }>(),
);
export const addFactorToDimension = createAction(
  StoreActions.ADD_FACTOR_TO_DIMENSION,
  props<{ factor: SuccessFactor; dimensionName: string }>(),
);
export const removeVisualizationDataForQuery = createAction(
  StoreActions.REMOVE_VISUALIZATION_DATA,
  props<{ query: string }>(),
);
export const editFactorInDimension = createAction(
  StoreActions.EDIT_FACTOR_IN_DIMENSION,
  props<{
    factor: SuccessFactor;
    oldFactorName: string;
    dimensionName: string;
  }>(),
);

export const addReqBazarProject = createAction(
  StoreActions.ADD_REQUIREMENTS_BAZAR_PROJECT,
  props<{
    project: ReqbazProject;
  }>(),
);

export const addGroup = createAction(
  HttpActions.ADD_GROUP,
  props<{ groupName: string }>(),
);
export const storeGroup = createAction(
  StoreActions.STORE_GROUP,
  props<{ group: GroupInformation }>(),
);
export const removeReqBazarProject = createAction(
  StoreActions.REMOVE_REQUIREMENTS_BAZAR_PROJECT,
  props<{
    id: number;
  }>(),
);
export const storeRequirements = createAction(
  StoreActions.STORE_REQUIREMENTS,
  props<{
    requirements: Requirement[];
  }>(),
);

export const setNumberOfRequirements = createAction(
  StoreActions.SET_NUMBER_OF_REQUIREMENTS,
  props<{
    n: number;
  }>(),
);

export const addMeasureToCatalog = createAction(
  StoreActions.ADD_MEASURE_TO_CATALOG,
  props<{ measure: Measure }>(),
);
export const addMeasureToFactor = createAction(
  StoreActions.ADD_MEASURE_TO_CATALOG,
  props<{
    measure: Measure;
    factorName: string;
    dimensionName: string;
  }>(),
);

export const editMeasure = createAction(
  StoreActions.EDIT_MEASURE,
  props<{
    measure: Measure;
    oldMeasureName: string;
    factorName: string;
    dimensionName: string;
  }>(),
);

export const editMeasureInCatalog = createAction(
  StoreActions.EDIT_MEASURE_IN_CATALOG,
  props<{
    measure: Measure;
    oldMeasureName: string;
  }>(),
);
export const storeGroups = createAction(
  StoreActions.STORE_SERVICES,
  props<{ groupsFromContactService; groupsFromMobSOS }>(),
);

export const removeFactor = createAction(
  StoreActions.REMOVE_FACTOR_FROM_DIMENSION,
  props<{ name: string }>(),
);

export const removeMeasure = createAction(
  StoreActions.REMOVE_MEASURE_FROM_FACTOR,
  props<{ name: string }>(),
);

export const saveModelAndCatalog = createAction(
  HttpActions.SAVE_MODEL_AND_CATALOG,
);

export const saveModel = createAction(
  HttpActions.SAVE_MODEL,
  props<{ xml: string }>(),
);

export const transferMissingGroupsToMobSOS = createAction(
  StateActions.TRANSFER_MISSING_GROUPS_TO_MOBSOS,
  props<{ groupsFromContactService; groupsFromMobSOS }>(),
);

export const saveCatalog = createAction(
  HttpActions.SAVE_CATALOG,
  props<{ xml: string }>(),
);

export const setGroup = createAction(
  StateActions.SET_GROUP,
  props<{ groupId: string }>(),
);

export const setService = createAction(
  StateActions.SET_SERVICE,
  props<{ service: ServiceInformation }>(),
);

export const setServiceName = createAction(
  StateActions.SET_SERVICE_NAME,
  props<{ serviceName: string }>(),
);

export const setCommunityWorkspace = createAction(
  StoreActions.SET_COMMUNITY_WORKSPACE,
  props<{
    workspace: CommunityWorkspace;
    owner?: string;
    serviceName?: string;
    selectedGroupId?: string;
  }>(),
);

export const setCommunityWorkspaceOwner = createAction(
  StoreActions.SET_COMMUNITY_WORKSPACE_OWNER,
  props<{
    owner?: string;
  }>(),
);

export const storeUser = createAction(
  StoreActions.STORE_USER,
  props<{ user: User }>(),
);

export const storeVisualizationData = createAction(
  StoreActions.STORE_VISUALIZATION_DATA,
  props<{ data?: any; query?: string; error?: any }>(),
);

export const storeCatalog = createAction(
  StoreActions.STORE_MEASURE_CATALOG,
  props<{ xml: string }>(),
);

export const storeSuccessModel = createAction(
  StoreActions.STORE_SUCCESS_MODEL,
  props<{ xml: string }>(),
);

export const updateCommunityWorkspace = createAction(
  StoreActions.UPDATE_COMMUNITY_WORKSPACE,
  props<{ workspace: CommunityWorkspace }>(),
);

export const joinWorkSpace = createAction(
  StateActions.JOIN_WORKSPACE,
  props<{
    groupId: string;
    serviceName: string;
    owner: string;
    username: string;
    role?: UserRole;
  }>(),
);

export const setUserName = createAction(
  StoreActions.STORE_USERNAME,
  props<{ username: string }>(),
);

// modes
export const incrementLoading = createAction(
  StateActions.INCREMENT_LOADING,
);
export const initState = createAction(StateActions.INITIALIZE_STATE);
export const decrementLoading = createAction(
  StateActions.DECREMENT_LOADING,
);
export const toggleEdit = createAction(StateActions.TOGGLE_EDIT);
export const enableEdit = createAction(StateActions.ENABLE_EDIT);
export const disableEdit = createAction(StateActions.DISABLE_EDIT);
export const toggleExpertMode = createAction(
  StateActions.TOGGLE_EXPERT_MODE,
);

// http results
export const successResponse = createAction(
  StateActions.SUCCESS_RESPONSE,
);
export const saveCatalogSuccess = createAction(
  HttpActions.SAVE_CATALOG_SUCCESS,
);
export const failureResponse = createAction(
  StateActions.FAILURE_RESPONSE,
  props<{ reason: Error }>(),
);

export const success = createAction('action was successful');

export const failure = createAction('action was not successful');
