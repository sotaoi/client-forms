import { BaseForm } from '@sotaoi/client-forms/form-classes/base-form';
import { BaseField, FieldConstructor } from '@sotaoi/client-forms/fields/base-field';
import {
  SingleCollectionConstructor,
  CollectionConstructor,
  SingleCollectionField,
  CollectionField,
} from '@sotaoi/client-forms/fields/collection-field';

const assignFields = (
  form: BaseForm,
  prefix: string,
  fields: {
    [key: string]: FieldConstructor | CollectionConstructor | SingleCollectionConstructor;
  }
): { [key: string]: BaseField<any> } => {
  const assignedFields: { [key: string]: BaseField<any> } = {};
  Object.entries(fields).map(([name, props]) => {
    const key = prefix ? `${prefix}.${name}` : name;
    if (props.type === 'singleCollection') {
      const collection = props as SingleCollectionConstructor;
      assignedFields[name] = new SingleCollectionField(
        name,
        () => form.rerender,
        form,
        key,
        () => form.formValidation,
        collection.fields,
        collection.values
      );
      return;
    }
    if (props.type === 'collection') {
      const collection = props as CollectionConstructor;
      assignedFields[name] = new CollectionField(
        name,
        () => form.rerender,
        form,
        key,
        () => form.formValidation,
        collection.min,
        collection.max,
        collection.fields,
        collection.values
      );
      return;
    }

    const constructor = props as FieldConstructor;
    assignedFields[name] = new (constructor.type as any)(
      name,
      key,
      () => form.formValidation,
      constructor.validations,
      () => form.rerender,
      constructor.value
    ) as BaseField<any>;
  });

  return assignedFields;
};

export { assignFields };
