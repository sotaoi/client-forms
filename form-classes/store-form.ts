import { CSSProperties } from 'react';
import { getStoreFormComponent } from '@sotaoi/client-forms/form-components/store-form-component';
import { AuthRecord, Artifacts } from '@sotaoi/contracts/artifacts';
import { BaseForm } from '@sotaoi/client-forms/form-classes/base-form';
import { FormConstructor } from '@sotaoi/client-forms/form-factories';

class StoreForm extends BaseForm {
  public FormComponent: React.FunctionComponent<{ children: any; formStyle?: CSSProperties; noFormElement?: boolean }>;
  public submit: () => void;

  constructor(
    formId: string,
    authRecord: null | AuthRecord,
    artifacts: Artifacts,
    role: null | string,
    repository: string,
    fields: FormConstructor,
    destroy: () => void
  ) {
    super(formId, authRecord, artifacts, role, repository, fields, destroy);
    this.FormComponent = getStoreFormComponent(this);

    this.submit = (): void => {
      this.action('store');
    };
  }
}

export { StoreForm };
