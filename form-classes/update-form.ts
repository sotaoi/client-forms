import { CSSProperties } from 'react';
import { getUpdateFormComponent } from '@sotaoi/client-forms/form-components/update-form-component';
import { BaseForm } from '@sotaoi/client-forms/form-classes/base-form';
import { AuthRecord, Artifacts } from '@sotaoi/contracts/artifacts';
import { FormConstructor } from '@sotaoi/client-forms/form-factories';

class UpdateForm extends BaseForm {
  public FormComponent: React.FunctionComponent<{ children: any; formStyle?: CSSProperties; noFormElement?: boolean }>;
  public uuid: string;
  public submit: () => void;

  constructor(
    formId: string,
    authRecord: null | AuthRecord,
    artifacts: Artifacts,
    role: null | string,
    repository: string,
    fields: FormConstructor,
    uuid: string,
    destroy: () => undefined
  ) {
    super(formId, authRecord, artifacts, role, repository, fields, destroy);
    this.uuid = uuid;
    this.FormComponent = getUpdateFormComponent(this);

    this.submit = (): void => {
      this.action('update');
    };
  }
}

export { UpdateForm };
