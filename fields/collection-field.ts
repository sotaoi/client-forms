import { assignFields } from '@sotaoi/client-forms/fields/assign-fields';
import { BaseField, FieldInit, FieldConstructor } from '@sotaoi/client-forms/fields/base-field';
import { Helper } from '@sotaoi/client-helper';
import { BaseForm } from '@sotaoi/client-forms/form-classes/base-form';
import { InputValidatorContract } from '@sotaoi/contracts/http/input-validator-contract';
import { BaseInput } from '@sotaoi/input/base-input';

interface SingleCollectionConstructor {
  type: 'singleCollection';
  fields: { [key: string]: FieldConstructor | CollectionConstructor | SingleCollectionConstructor };
  values: { [key: string]: FieldConstructor | CollectionConstructor | SingleCollectionConstructor };
}

interface CollectionConstructor {
  type: 'collection';
  min: number;
  max: number;
  fields: { [key: string]: FieldConstructor | CollectionConstructor | SingleCollectionConstructor };
  values: { [key: string]: FieldConstructor | CollectionConstructor | SingleCollectionConstructor }[];
}

class SingleCollectionField extends BaseField<any> {
  public type: 'singleCollection' = 'singleCollection';
  public form: BaseForm;
  public fields: { [key: string]: BaseField<any> } = {};
  public values: { [key: string]: FieldConstructor | CollectionConstructor | SingleCollectionConstructor };

  public standardFields: () => { [key: string]: BaseField<any> };

  constructor(
    name: string,
    getSetState: () => (force: boolean) => void,
    form: BaseForm,
    key: string,
    getFormValidation: () => InputValidatorContract<(key: string) => void | null | BaseInput<any, any>>,
    standardFields: { [key: string]: FieldConstructor | CollectionConstructor | SingleCollectionConstructor },
    values: { [key: string]: FieldConstructor | CollectionConstructor | SingleCollectionConstructor }
  ) {
    super(name, key, getFormValidation, [], getSetState, null);
    this.form = form;
    this.standardFields = (): { [key: string]: BaseField<any> } => {
      return assignFields(this.form, `${key}.fields`, standardFields);
    };
    this.fields = { ...this.standardFields() };
    this.values = values;
    this.assignValues();
  }

  public init(): FieldInit {
    throw new Error('collection field does not have init method');
  }

  public set(values: { [key: string]: FieldConstructor | CollectionConstructor | SingleCollectionConstructor }): void {
    this.values = values;
  }

  public clear(): void {
    throw new Error('collection field does not have clear method');
  }

  public getFields(): { [key: string]: BaseField<any> } {
    return this.fields;
  }

  public isEmpty(): boolean {
    throw new Error('collection field cannot be empty or otherwise');
  }

  public convert(value: any): any {
    return value;
  }

  public getInputValue(value: any = this.value): null {
    throw new Error('cannot get field value of a collection');
  }

  public wasChanged(): boolean {
    throw new Error('single collection field cannot implement "wasChanged"');
  }

  public assignValues(): void {
    Object.entries(this.values).map(([key, value]) => {
      this.fields[key].set(this.fields[key].convert(value));
    });
  }

  // no-op

  public initialState(props: any): any {
    throw new Error('single collection field cannot implement "initialState"');
  }

  public setValue(context: React.Component<any, any>): void {
    throw new Error('single collection field cannot implement "getValue"');
  }

  public getValue(context: React.Component<any, any>): any {
    throw new Error('single collection field cannot implement "getValue"');
  }

  public render(context: React.Component<any, any>): null | React.ReactElement {
    throw new Error('single collection field cannot implement "render"');
  }
}

class CollectionField extends BaseField<any> {
  public type: 'collection' = 'collection';
  public form: BaseForm;
  public min: null | number;
  public max: null | number;
  public fields: { [key: string]: BaseField<any> }[] = [];
  public values: { [key: string]: FieldConstructor | CollectionConstructor | SingleCollectionConstructor }[];

  public standardFields: () => { [key: string]: BaseField<any> };

  constructor(
    name: string,
    getSetState: () => (force: boolean) => void,
    form: BaseForm,
    key: string,
    getFormValidation: () => InputValidatorContract<(key: string) => void | null | BaseInput<any, any>>,
    min: null | number,
    max: null | number,
    standardFields: { [key: string]: FieldConstructor | CollectionConstructor | SingleCollectionConstructor },
    values: { [key: string]: FieldConstructor | CollectionConstructor | SingleCollectionConstructor }[]
  ) {
    super(name, key, getFormValidation, [], getSetState, null);
    this.form = form;
    this.min = min;
    this.max = max;
    this.values = values;
    this.standardFields = (): { [key: string]: BaseField<any> } =>
      assignFields(this.form, `${key}.fields.${this.fields.length.toString()}`, standardFields);

    if (this.min || this.values.length) {
      const count = this.values.length > (this.min || 0) ? this.values.length : this.min || 0;
      for (let i = 0; i < count; i++) {
        const values = typeof this.values[i] !== 'undefined' ? this.values[i] : null;
        this._addGroup(values);
      }
    }
  }

  public getSizeErrors(): string[] {
    const key = `${this.key}.size`;
    const apiErrors = this.getFormValidation().getApiErrors(key);
    if (apiErrors.length) {
      return apiErrors;
    }
    return this.getFormValidation().getErrors(key);
  }

  public init(): FieldInit {
    throw new Error('collection field does not have init method');
  }

  public set(
    values: { [key: string]: FieldConstructor | CollectionConstructor | SingleCollectionConstructor }[]
  ): void {
    this.values = values;
    for (let i = 0; i < this.values.length; i++) {
      if (typeof this.fields[i] === 'undefined') {
        this.addGroup();
        continue;
      }
      this.assignValues(this.fields[i], this.values[i]);
    }
  }

  public static ok(): string {
    return 'asd';
  }

  public clear(): void {
    throw new Error('collection field does not have clear method');
  }

  public getFieldGroups(): { [key: string]: BaseField<any> }[] {
    return this.fields;
  }

  public addGroup(): void {
    if (!this.canAddGroup()) {
      return;
    }
    this._addGroup(null);

    this.getFormValidation()
      .validateCollections(this.form.fields, this.form.validations, '')
      .then((res) => {
        this.rerender(true);
      });
  }

  public reindex(from: number, to: number): void {
    let index: number;
    const field = this.fields[from];
    this.fields.splice(to, 0, field);
    (index = this.fields.indexOf(field)) === to ? this.fields.splice(from + 1, 1) : this.fields.splice(index, 1);
    this.renderUuid = Helper.uuid();
    this.rerender(true);
  }

  public canAddGroup(): boolean {
    return !(this.max !== null && this.fields.length >= this.max);
  }

  public canRemoveGroup(index: number): boolean {
    return index < this.fields.length && (this.min === null || this.fields.length > this.min);
  }

  public removeGroup(index: number): void {
    if (index >= this.fields.length) {
      console.warn('cannot remove group, bad index');
      return;
    }
    if (this.min && this.fields.length <= this.min) {
      console.warn('cannot remove group, minimum field groups required');
      return;
    }

    this.fields.splice(index, 1);
    this.renderUuid = Helper.uuid();

    this.getFormValidation()
      .validateCollections(this.form.fields, this.form.validations, '')
      .then((res) => {
        this.rerender(true);
      });
  }

  public assignValues(
    collectionFieldGroup: { [key: string]: BaseField<any> },
    values: null | { [key: string]: any }
  ): void {
    try {
      values &&
        Object.entries(values).map(([key, value]) => {
          collectionFieldGroup[key].set(collectionFieldGroup[key].convert(value));
        });
    } catch (err) {
      console.warn(err);
    }
  }

  public wasChanged(): boolean {
    throw new Error('multi collection field cannot implement "wasChanged"');
  }

  public convert(value: any): any {
    return value;
  }

  public isEmpty(): boolean {
    throw new Error('collection field cannot be empty or otherwise');
  }

  public getInputValue(input: any): null {
    throw new Error('cannot get field value of a collection');
  }

  protected _addGroup(values: null | { [key: string]: any }): void {
    const collectionFieldGroup = { ...this.standardFields() };
    this.assignValues(collectionFieldGroup, values);
    this.fields.push(collectionFieldGroup);
  }

  // no-op

  public initialState(props: any): any {
    throw new Error('multi collection field cannot implement "initialState"');
  }

  public setValue(context: React.Component<any, any>): void {
    throw new Error('multi collection field cannot implement "setValue"');
  }

  public getValue(context: React.Component<any, any>): any {
    throw new Error('multi collection field cannot implement "getValue"');
  }

  public render(context: React.Component<any, any>): null | React.ReactElement {
    throw new Error('multi collection field cannot implement "render"');
  }
}

export { SingleCollectionField, CollectionField };
export type { SingleCollectionConstructor, CollectionConstructor };
