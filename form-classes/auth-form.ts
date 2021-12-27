import { CSSProperties } from 'react';
import { getAuthFormComponent } from '@sotaoi/client-forms/form-components/auth-form-component';
import { BaseForm } from '@sotaoi/client-forms/form-classes/base-form';
import { Artifacts } from '@sotaoi/contracts/artifacts';
import { FormConstructor } from '@sotaoi/client-forms/form-factories';

class AuthForm extends BaseForm {
  public FormComponent: React.FunctionComponent<{ children: any; formStyle?: CSSProperties; noFormElement?: boolean }>;
  public strategy: string;
  public submit: () => void;

  constructor(
    formId: string,
    artifacts: Artifacts,
    repository: string,
    fields: FormConstructor,
    strategy: string,
    destroy: () => undefined
  ) {
    super(formId, null, artifacts, null, repository, fields, destroy);
    this.strategy = strategy;
    this.FormComponent = getAuthFormComponent(this);

    this.submit = (): void => {
      this.action('auth');
    };
  }
}

export { AuthForm };
