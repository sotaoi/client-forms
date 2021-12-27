import React from 'react';
import { Helper } from '@sotaoi/client/helper';
import { InputValidatorContract } from '@sotaoi/contracts/http/input-validator-contract';
import { BaseInput, FieldValidation } from '@sotaoi/input/base-input';
import type { CollectionField as CollectionFieldType } from '@sotaoi/client-forms/fields/collection-field';

interface FieldConstructor {
  type: typeof BaseField;
  value: any;
  validations: any;
}

interface FieldInit {
  [key: string]: any;
  value: any;
  onChange: (ev: any) => void;
  onBlur: (ev: any) => void;
  onKeyUp?: (ev: any) => void;
}

abstract class BaseComponent<ValueType, ComponentProps, ComponentState> extends React.Component<
  ComponentProps,
  ComponentState
> {
  abstract setValue(input: ValueType): void;
  abstract getValue(): any;
}
abstract class BaseField<ValueType, ComponentProps = any, ComponentState = any> {
  abstract init(): FieldInit;
  abstract set(value: ValueType): void;
  abstract clear(): void;
  abstract isEmpty(): boolean;
  abstract convert(value: any): ValueType;
  abstract getInputValue(input?: ValueType): any;
  abstract wasChanged(): boolean;
  //
  abstract initialState(props: ComponentProps): ComponentState;
  abstract setValue(input: ValueType, context: React.Component<ComponentProps, ComponentState>): void;
  abstract getValue(context: React.Component<ComponentProps, ComponentState>): any;
  abstract render(context: React.Component<ComponentProps, ComponentState>): null | React.ReactElement;

  public renderUuid: string;
  public name: string;
  public readonly key: string;
  public getFormValidation: () => InputValidatorContract<(key: string) => void | null | BaseInput<any, any>>;
  public validations: null | FieldValidation[];
  public rerender: (force?: boolean) => void;
  public value: ValueType;
  public initialValue: ValueType;
  public touched: boolean;
  public _ref: null | BaseComponent<ValueType, ComponentProps, ComponentState>;

  public component:
    | React.ComponentClass<ComponentProps | { [key: string]: any }>
    | React.FunctionComponent<ComponentProps | { [key: string]: any }>;

  constructor(
    name: string,
    key: string,
    getFormValidation: () => InputValidatorContract<(key: string) => void | null | BaseInput<any, any>>,
    validations: null | FieldValidation[],
    getRerender: () => (force: boolean) => void,
    value: ValueType
  ) {
    this.renderUuid = Helper.uuid();
    this.name = name;
    this.key = key;
    this.getFormValidation = getFormValidation;
    this.validations = validations;
    this.rerender = (force = false): void => getRerender()(force);
    this.value = value;
    this.initialValue = Helper.clone(value);
    this.touched = false;
    this._ref = null;

    const self = this;
    const Component = class extends BaseComponent<ValueType, ComponentProps, ComponentState> {
      constructor(props: ComponentProps) {
        super(props);
        this.state = self.initialState(props);
      }
      public setValue(input: ValueType): void {
        return self.setValue(input, this);
      }
      public getValue(): any {
        return self.getValue(this);
      }
      public render(): null | React.ReactElement {
        return self.render(this);
      }
    };

    this.component = class extends React.Component<ComponentProps> {
      public render(): null | React.ReactElement {
        return (
          <Component
            ref={(ref): null | BaseComponent<ValueType, ComponentProps, ComponentState> => ref && (self._ref = ref)}
            {...self.init()}
            {...this.props}
          />
        );
      }
    } as any;
  }

  public asset(item: null | string, role = 'assets'): null | string {
    return Helper.asset(item, role);
  }
  public assets(items: null | string, role = 'assets'): null | string[] {
    return (items && JSON.parse(items).map((item: string) => Helper.asset(item, role))) || null;
  }

  public getKey(index: number): string {
    const fields = (this as any).fields || {};
    return `${fields.length}:${index.toString()}:${this.renderUuid}`;
  }

  public async validate(): Promise<void> {
    if (!this.validations) {
      throw new Error('method "validate" should not have been called when null');
    }
    await this.getFormValidation().validate(this.key, this.validations);
  }

  public isValid(): boolean {
    return !this.getFormValidation().getErrors(this.key).length;
  }

  public getErrors(): string[] {
    const apiErrors = this.getFormValidation().getApiErrors(this.key);
    if (apiErrors.length) {
      return apiErrors;
    }
    return this.getFormValidation().getErrors(this.key);
  }

  public setTouched(touched: boolean): void {
    this.touched = touched;
  }

  public wasTouched(): boolean {
    return this.touched;
  }

  public collection(): CollectionFieldType {
    const { CollectionField } = require('@sotaoi/client-forms/fields/collection-field');
    if (!(this instanceof CollectionField)) {
      throw new Error('Field is not a CollectionField');
    }
    return this as any;
  }

  public addGroup(): void {
    throw new Error('cannot add field group, this is a single unit field (non collection)');
  }

  public canRemoveGroup(index: number): boolean {
    throw new Error('cannot call "canRemoveGroup" method, this is a single unit field (non collection)');
  }

  public removeGroup(index: number): void {
    throw new Error('cannot remove field group, this is a single unit field (non collection)');
  }

  public static input(value: any): { input: BaseInput<any, any>; field: typeof BaseField } {
    const instance: BaseField<any> = new (this as any)(
      '',
      '',
      '',
      () => ({}),
      [],
      () => ({}),
      null
    );
    return instance.convert(value).input(instance.constructor);
  }
}

export { BaseField };
export type { FieldInit, FieldConstructor };
