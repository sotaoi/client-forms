import { StoreForm } from '@sotaoi/client-forms/form-classes/store-form';
import { UpdateForm } from '@sotaoi/client-forms/form-classes/update-form';
import { AuthForm } from '@sotaoi/client-forms/form-classes/auth-form';
import { AuthRecord, Artifacts } from '@sotaoi/contracts/artifacts';
import { FormValidations } from '@sotaoi/input/base-input';
import { FieldConstructor } from '@sotaoi/client-forms/fields/base-field';
import { SingleCollectionConstructor, CollectionConstructor } from '@sotaoi/client-forms/fields/collection-field';
import { BaseForm } from '@sotaoi/client-forms/form-classes/base-form';
import { Helper } from '@sotaoi/client/helper';
import _ from 'lodash';
import { TaskForm } from '@sotaoi/client-forms/form-classes/task-form';

interface FormConstructor {
  constructors: { [key: string]: FieldConstructor | CollectionConstructor | SingleCollectionConstructor };
  validations: FormValidations;
}

const StoreFormFactory = (
  authRecord: null | AuthRecord,
  artifacts: Artifacts,
  role: null | string,
  repository: string,
  fields: FormConstructor
): StoreForm => {
  let formId: string;
  const formSerial = JSON.stringify({
    type: 'store',
    authRecord,
    artifacts,
    role,
    repository,
    fieldTypes: Object.entries(fields.constructors).reduce(
      (
        result: { [key: string]: any },
        [key, field],
        index: number
      ): {
        [key: string]: any;
      } => {
        result[key] = field.type;
        return result;
      },
      {}
    ),
    fieldValidations: fields.validations,
  });
  const formSerialIndex = Object.values(BaseForm.formSerials).indexOf(formSerial);
  if (formSerialIndex === -1) {
    formId = Helper.uuid();
    BaseForm.formSerials[formId] = formSerial;
  } else {
    formId = Object.keys(BaseForm.formSerials)[formSerialIndex];
  }
  if (BaseForm.instances[formId]) {
    if (!(BaseForm.instances[formId] instanceof StoreForm)) {
      throw new Error('Something went wrong');
    }
    if (JSON.stringify(fields) !== BaseForm.instances[formId].serializedDescriptors) {
      BaseForm.instances[formId].resetFieldDescriptors(fields);
      BaseForm.instances[formId].rerender(true);
    }
    return BaseForm.instances[formId];
  }
  const storeForm = new StoreForm(formId, authRecord, artifacts, role, repository, fields, (): any => {
    delete BaseForm.instances[formId];
    // delete BaseForm.formSerials[formId];
  });
  BaseForm.instances[formId] = storeForm;
  return storeForm;
};

const UpdateFormFactory = (
  authRecord: null | AuthRecord,
  artifacts: Artifacts,
  role: null | string,
  repository: string,
  fields: FormConstructor,
  uuid: string
): UpdateForm => {
  let formId: string;
  const formSerial = JSON.stringify({
    type: 'update',
    authRecord,
    artifacts,
    role,
    repository,
    fieldConstructors: Object.keys(fields.constructors),
    fieldValidations: fields.validations,
    uuid,
  });
  const formSerialIndex = Object.values(BaseForm.formSerials).indexOf(formSerial);
  if (formSerialIndex === -1) {
    formId = Helper.uuid();
    BaseForm.formSerials[formId] = formSerial;
  } else {
    formId = Object.keys(BaseForm.formSerials)[formSerialIndex];
  }
  if (BaseForm.instances[formId]) {
    if (!(BaseForm.instances[formId] instanceof UpdateForm)) {
      throw new Error('Something went wrong');
    }
    if (JSON.stringify(fields) !== BaseForm.instances[formId].serializedDescriptors) {
      BaseForm.instances[formId].resetFieldDescriptors(fields);
      BaseForm.instances[formId].rerender(true);
    }
    return BaseForm.instances[formId];
  }
  const updateForm = new UpdateForm(formId, authRecord, artifacts, role, repository, fields, uuid, (): any => {
    delete BaseForm.instances[formId];
    // delete BaseForm.formSerials[formId];
  });
  BaseForm.instances[formId] = updateForm;
  return updateForm;
};

const AuthFormFactory = (
  artifacts: Artifacts,
  repository: string,
  fields: FormConstructor,
  strategy: string
): AuthForm => {
  let formId: string;
  const formSerial = JSON.stringify({
    type: 'auth',
    artifacts,
    repository,
    fieldConstructors: Object.keys(fields.constructors),
    fieldValidations: fields.validations,
    strategy,
  });
  const formSerialIndex = Object.values(BaseForm.formSerials).indexOf(formSerial);
  if (formSerialIndex === -1) {
    formId = Helper.uuid();
    BaseForm.formSerials[formId] = formSerial;
  } else {
    formId = Object.keys(BaseForm.formSerials)[formSerialIndex];
  }
  if (BaseForm.instances[formId]) {
    if (!(BaseForm.instances[formId] instanceof AuthForm)) {
      throw new Error('Something went wrong');
    }
    if (JSON.stringify(fields) !== BaseForm.instances[formId].serializedDescriptors) {
      BaseForm.instances[formId].resetFieldDescriptors(fields);
      BaseForm.instances[formId].rerender(true);
    }
    return BaseForm.instances[formId];
  }
  const authForm = new AuthForm(formId, artifacts, repository, fields, strategy, (): any => {
    delete BaseForm.instances[formId];
    // delete BaseForm.formSerials[formId];
  });
  BaseForm.instances[formId] = authForm;
  return authForm;
};

const TaskFormFactory = (
  authRecord: null | AuthRecord,
  artifacts: Artifacts,
  role: null | string,
  repository: string,
  task: string,
  fields: FormConstructor
): TaskForm => {
  let formId: string;
  const formSerial = JSON.stringify({
    type: 'task',
    authRecord,
    artifacts,
    role,
    repository,
    task,
    fieldConstructors: Object.keys(fields.constructors),
    fieldValidations: fields.validations,
  });
  const formSerialIndex = Object.values(BaseForm.formSerials).indexOf(formSerial);
  if (formSerialIndex === -1) {
    formId = Helper.uuid();
    BaseForm.formSerials[formId] = formSerial;
  } else {
    formId = Object.keys(BaseForm.formSerials)[formSerialIndex];
  }
  if (BaseForm.instances[formId]) {
    if (!(BaseForm.instances[formId] instanceof TaskForm)) {
      throw new Error('Something went wrong');
    }
    if (JSON.stringify(fields) !== BaseForm.instances[formId].serializedDescriptors) {
      BaseForm.instances[formId].resetFieldDescriptors(fields);
      BaseForm.instances[formId].rerender(true);
    }
    return BaseForm.instances[formId];
  }
  const taskForm = new TaskForm(formId, authRecord, artifacts, role, repository, task, fields, (): any => {
    delete BaseForm.instances[formId];
    // delete BaseForm.formSerials[formId];
  });
  BaseForm.instances[formId] = taskForm;
  return taskForm;
};

const FormConstructor = (init: { [key: string]: any }, validations: FormValidations): FormConstructor => {
  const collectionCleanup: (() => void)[] = [];
  const iteration = Helper.iterate(Helper.clone(validations), '', (item, prefix, transformer, prop) => {
    if (!(item instanceof Array)) {
      const nextKey = prefix ? `${prefix}.${prop}` : prop;
      collectionCleanup.push(() => _.unset(init, nextKey));
      // single collection
      const scolFieldInit = _.get(init, prefix ? `${prefix}.${prop}` : prop).values || {};
      if (typeof item.min === 'undefined' && typeof item.max === 'undefined') {
        return {
          type: 'singleCollection',
          fields: Helper.iterate(item.fields, `${nextKey}.fields`, transformer),
          values: scolFieldInit,
        };
      }
      // multi collection
      const mcolFieldInit = _.get(init, prefix ? `${prefix}.${prop}` : prop).values || [];
      return {
        type: 'collection',
        min: item.min,
        max: item.max,
        fields: Helper.iterate(item.fields, `${nextKey}.fields`, transformer),
        values: mcolFieldInit,
      };
    }
    const key = prefix ? `${prefix}.${prop}` : prop;
    const fieldInit = _.get(init, key);
    if (!fieldInit) {
      throw new Error(`[FormConstructor]: field "${key}" is missing in init, although it is found in validations`);
    }
    _.unset(init, key);
    return {
      type: fieldInit.field,
      value: fieldInit.input,
      validations: item,
    };
  });
  collectionCleanup.map((fn) => fn());
  if (Object.keys(init).length) {
    // throw new Error(`[FormConstructor]: form field constructor is corrupt`);
  }
  return { constructors: iteration, validations };
};

export { StoreFormFactory, UpdateFormFactory, AuthFormFactory, TaskFormFactory, FormConstructor };
