import React from 'react';
import { BaseField, FieldConstructor } from '@sotaoi/client-forms/fields/base-field';
import { assignFields } from '@sotaoi/client-forms/fields/assign-fields';
import { Payload, CommandResult, AuthResult, TaskResult, ActionConclusion } from '@sotaoi/contracts/transactions';
import { AuthRecord, Artifacts } from '@sotaoi/contracts/artifacts';
import { BaseInput, FormValidations } from '@sotaoi/input/base-input';
import { Helper } from '@sotaoi/client/helper';
import { SingleCollectionConstructor, CollectionConstructor } from '@sotaoi/client-forms/fields/collection-field';
import { InputValidatorContract, InputValidationResult } from '@sotaoi/contracts/http/input-validator-contract';
import _ from 'lodash';
import { action } from '@sotaoi/client/action';
import { output } from '@sotaoi/client/output';
import { store } from '@sotaoi/client/store';

interface FormState {
  getFields: () => { [key: string]: BaseField<any> };
  canSubmit: boolean;
  valid: boolean;
  sending: boolean;
  validating: boolean;
  errors: string;
  apiErrors: string;
}

abstract class BaseForm {
  abstract FormComponent: React.FunctionComponent<{ children: any }>;

  public formId: string;
  public authRecord: null | AuthRecord;
  public artifacts: Artifacts;
  public role: null | string;
  public repository: string;
  public serializedDescriptors: string;
  public uuid: null | string;
  public strategy: null | string;
  public task: null | string;
  public fieldConstructors: { [key: string]: FieldConstructor | CollectionConstructor | SingleCollectionConstructor };
  public fields: { [key: string]: BaseField<any> };
  public formValidation: InputValidatorContract<(key: string) => void | null | BaseInput<any, any>>;

  public unmounted = false;

  public validations: FormValidations;

  public setState: <StateType = { [key: string]: any }>(state: StateType) => void;
  public getState: () => { [key: string]: any };

  public rerender: (force: boolean) => void;
  public onCommandSuccess: (onCommandSuccessFn: (result: CommandResult) => Promise<any>) => void;
  public onAuthSuccess: (onAuthSuccessFn: (result: AuthResult) => Promise<any>) => void;
  public onTaskSuccess: (onTaskSuccessFn: (result: TaskResult) => Promise<any>) => void;

  public destroy: () => void;

  public static NOTIFY = false;
  public static instances: { [key: string]: any } = {};
  public static formSerials: { [key: string]: string } = {};

  protected state: null | { [key: string]: any };
  protected initialState: null | { [key: string]: any };

  protected _sending: boolean;
  protected _validating: boolean;
  protected _realOnCommandSuccess: (result: CommandResult) => Promise<any>;
  protected _realOnAuthSuccess: (result: AuthResult) => Promise<any>;
  protected _realOnTaskSuccess: (result: TaskResult) => Promise<any>;

  protected static inputValidator: InputValidatorContract;

  public reset: () => void;

  constructor(
    formId: string,
    authRecord: null | AuthRecord,
    artifacts: Artifacts,
    role: null | string,
    repository: string,
    fieldDescriptors: {
      constructors: { [key: string]: FieldConstructor | CollectionConstructor | SingleCollectionConstructor };
      validations: FormValidations;
    },
    destroy: () => void
  ) {
    if (typeof BaseForm.inputValidator === 'undefined') {
      throw new Error('form initialization error, no input validator');
    }

    this.formId = formId;
    this.authRecord = authRecord;
    this.artifacts = artifacts;
    this.role = role;
    this.repository = repository;
    this.serializedDescriptors = JSON.stringify(fieldDescriptors);
    this.uuid = null;
    this.strategy = null;
    this.task = null;
    this.fieldConstructors = fieldDescriptors.constructors;
    this.fields = assignFields(this, '', this.fieldConstructors);
    this.formValidation = BaseForm.inputValidator.getFormValidation(
      (key: string) => _.get(this.getFields(), key)?.value || null
    );

    this.setState = <StateType = { [key: string]: any }>(state: StateType): void => undefined;
    this.getState = (): { [key: string]: any } => ({
      getFields: (): { [key: string]: BaseField<any> } => ({}),
      canSubmit: false,
      valid: false,
      sending: false,
      validating: false,
      errors: '',
      apiErrors: '',
    });

    this.rerender = (): void => undefined;
    this.onCommandSuccess = (onCommandSuccessFn: (result: CommandResult) => Promise<any>): void => {
      this._realOnCommandSuccess = onCommandSuccessFn;
    };
    this.onAuthSuccess = (onAuthSuccessFn: (result: AuthResult) => Promise<any>): void => {
      this._realOnAuthSuccess = onAuthSuccessFn;
    };
    this.onTaskSuccess = (onTaskSuccessFn: (result: TaskResult) => Promise<any>): void => {
      this._realOnTaskSuccess = onTaskSuccessFn;
    };

    this.destroy = destroy;

    this.validations = fieldDescriptors.validations;
    this._sending = false;
    this._validating = false;
    this._realOnCommandSuccess = async (result: CommandResult): Promise<void> => undefined;
    this._realOnAuthSuccess = async (result: AuthResult): Promise<void> => undefined;
    this._realOnTaskSuccess = async (result: TaskResult): Promise<void> => undefined;

    this.state = null;
    this.initialState = null;

    this.reset = (): void => {
      this.destroy();
      this.setState(Helper.clone(this.initialState || {}));
    };
  }

  public init = (initialState: { [key: string]: any } = {}): void => {
    this.unmounted = false;
    if (this.initialState === null || this.state === null) {
      this.initialState = Helper.clone({
        ...initialState,
        form: this._getFormState(),
      });
      this.state = Helper.clone(this.initialState);
    }

    let [state, _setState] = React.useState(this.state);
    this.setState = (state: { [key: string]: any } = {}): void => {
      _setState({
        ...state,
        form: this._getFormState(),
      });
    };
    this.getState = (): { [key: string]: any } => state;

    this.rerender = (force = false): void => {
      if (this.unmounted) {
        return;
      }
      state.form = this._getFormState();
      if (force) {
        _setState({ ...state });
        return;
      }
      _setState(state);
    };
  };

  public unmount = (): void => {
    this.destroy();
    this.unmounted = true;
  };

  //

  public resetFieldDescriptors = (fieldDescriptors: {
    constructors: { [key: string]: FieldConstructor | CollectionConstructor | SingleCollectionConstructor };
    validations: FormValidations;
  }): void => {
    this.serializedDescriptors = JSON.stringify(fieldDescriptors);
    this.fieldConstructors = fieldDescriptors.constructors;
    this.fields = assignFields(this, '', this.fieldConstructors);
    this.validations = fieldDescriptors.validations;
  };

  //

  public async action(type: 'store' | 'update' | 'auth' | 'task'): Promise<void> {
    try {
      let conclusion: ActionConclusion;
      let commandOutput: CommandResult;
      let authOutput: AuthResult;
      let taskOutput: TaskResult;
      let validationResult: InputValidationResult;
      const isUpdateCommand = type === 'update' && output().allowSkipUnchanged();

      Helper.iterate(this.fields, '', output().getTouchFieldsTransformer(isUpdateCommand));

      this.setValidating(true);
      await this.formValidation.validatePayload(
        this.fields,
        this.validations,
        '',
        type === 'update' && output().allowSkipUnchanged()
      );
      validationResult = this.formValidation.getResult();
      this.setValidating(false);
      if (!validationResult.valid) {
        // todo lowprio: sweet alert
        console.warn('Validation result: ', validationResult);
        return;
      }

      this.setSending(true);
      let payloadInit: { [key: string]: string | Blob | Blob[] };
      switch (true) {
        case type === 'store':
          payloadInit = Helper.flatten(
            Helper.iterate(Helper.clone(this._getFormState().getFields()), '', output().getFieldTransformer(false))
          );
          conclusion = await action().store(
            // access token
            store().getAccessToken(),
            // artifacts
            this.artifacts,
            // role
            this.role,
            // repository
            this.repository,
            // payload
            new Payload(payloadInit)
          );
          BaseForm.NOTIFY && (await conclusion.notify());
          commandOutput = conclusion.commandResult();
          break;
        case type === 'update':
          payloadInit = Helper.flatten(
            Helper.iterate(Helper.clone(this._getFormState().getFields()), '', output().getFieldTransformer(true))
          );
          if (!this.uuid) {
            throw new Error('something went wrong - update form is missing uuid');
          }
          conclusion = await action().update(
            // access token
            store().getAccessToken(),
            // artifacts
            this.artifacts,
            // role
            this.role,
            // repository
            this.repository,
            // uuid,
            this.uuid,
            // payload
            new Payload(payloadInit)
          );
          BaseForm.NOTIFY && (await conclusion.notify());
          commandOutput = conclusion.commandResult();
          break;
        case type === 'auth':
          payloadInit = Helper.flatten(
            Helper.iterate(Helper.clone(this._getFormState().getFields()), '', output().getFieldTransformer(false))
          );
          if (!this.strategy) {
            throw new Error('something went wrong - auth form is missing strategy');
          }
          conclusion = await action().auth(
            // artifacts
            this.artifacts,
            // repository
            this.repository,
            // strategy
            this.strategy || '',
            // payload
            new Payload(payloadInit)
          );
          // no await notify here
          // BaseForm.NOTIFY && (await conclusion.notify());
          BaseForm.NOTIFY && conclusion.notify();
          authOutput = conclusion.authResult();

          if (!authOutput.success) {
            this.formValidation.setErrorResult(authOutput.getError());
            this.setSending(false);
            return;
          }
          if (!authOutput.authRecord) {
            throw new Error('something went wrong - auth command failure');
          }
          authOutput.authRecord = AuthRecord.deserialize(authOutput.authRecord);
          if (!(authOutput.authRecord instanceof AuthRecord)) {
            throw new Error('something went wrong - auth record unknown type');
          }

          this.setSending(false);
          this.reset();

          await store().setAuthRecord(authOutput.authRecord, authOutput.accessToken);
          await this._realOnAuthSuccess(authOutput);

          return;
        case type === 'task':
          payloadInit = Helper.flatten(
            Helper.iterate(Helper.clone(this._getFormState().getFields()), '', output().getFieldTransformer(false))
          );
          if (!this.task) {
            throw new Error('something went wrong - no task in form');
          }
          conclusion = await action().task(
            // access token
            store().getAccessToken(),
            // artifacts
            this.artifacts,
            // role
            this.role,
            // repository
            this.repository,
            // task,
            this.task,
            // payload
            new Payload(payloadInit)
          );
          BaseForm.NOTIFY && (await conclusion.notify());
          taskOutput = conclusion.taskResult();

          if (!taskOutput.success) {
            this.formValidation.setErrorResult(taskOutput.getError());
            this.setSending(false);
            return;
          }

          this.setSending(false);
          this.reset();
          await this._realOnTaskSuccess(taskOutput);

          return;
        default:
          throw new Error(`action type "${type}" not implemented`);
      }

      if (!commandOutput.success) {
        this.formValidation.setErrorResult(commandOutput.getError());
        this.setSending(false);
        return;
      }

      this.setSending(false);
      type !== 'update' && this.reset();
      await this._realOnCommandSuccess(commandOutput);
    } catch (err) {
      this.setSending(false);
      this.setValidating(false);
      console.warn(err);
    }
  }

  public getFormState(): FormState {
    return this.getState().form;
  }

  public getFields<
    FieldState extends { [key: string]: BaseField<any> } = { [key: string]: BaseField<any> }
  >(): FieldState {
    return this.getState().form.getFields();
  }

  public static setup(inputValidator: InputValidatorContract): void {
    this.inputValidator = inputValidator;
  }

  protected setSending(sending: boolean): void {
    this._sending = sending;
    this.setState({ ...this.getState() });
  }

  protected setValidating(validating: boolean): void {
    this._validating = validating;
    this.setState({ ...this.getState() });
  }

  protected _getFormState(): FormState {
    return {
      getFields: (): { [key: string]: BaseField<any> } => BaseForm.instances[this.formId].fields,
      // canSubmit: this.formValidation.isValid() && !this._sending && !this._validating,
      canSubmit: !this._sending && !this._validating,
      valid: this.formValidation.isValid(),
      sending: this._sending,
      validating: this._validating,
      errors: JSON.stringify(this.formValidation.getResult().validations),
      apiErrors: JSON.stringify(this.formValidation.getAllApiErrors()),
    };
  }
}

export { BaseForm };
