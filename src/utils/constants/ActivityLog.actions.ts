export const ActivityLogActions = {
  LOGIN: 'login',
  CHANGE_PASSWORD: 'change_password',
  UPDATE_PROFILE: 'update_profile',

  CREATE_PROJECT: 'create_project',
  UPDATE_PROJECT: 'update_project',
  DELETE_PROJECT: 'delete_project',

  CREATE_DATASET: 'create_dataset',
  APPROVE_DATASET: 'approve_dataset',
  REJECT_DATASET: 'reject_dataset',
  FLAG_DATASET: 'flag_dataset',

  CREATE_TASK: 'create_task',
  UPDATE_TASK: 'update_task',
  DELETE_TASK: 'delete_task',
  CLOSE_TASK: 'close_task',

  CREATE_MICRO_TASK: 'create_micro_task',
  UPDATE_MICRO_TASK: 'update_micro_task',
  DELETE_MICRO_TASK: 'delete_micro_task',
};
export const ActivityEntityType = {
  USER: 'user',
  PROJECT: 'project',
  DATASET: 'dataset',
  TASK: 'task',
  MICRO_TASK: 'micro_task',
};
