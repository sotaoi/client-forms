import { CSSProperties } from 'react';
import { getTaskFormComponent } from '@sotaoi/client-forms/form-components/task-form-component';
import { BaseForm } from '@sotaoi/client-forms/form-classes/base-form';
import { Artifacts, AuthRecord } from '@sotaoi/contracts/artifacts';
import { FormConstructor } from '@sotaoi/client-forms/form-factories';

class TaskForm extends BaseForm {
  public FormComponent: React.FunctionComponent<{ children: any; formStyle?: CSSProperties; noFormElement?: boolean }>;
  public task: string;
  public submit: () => void;

  constructor(
    formId: string,
    authRecord: null | AuthRecord,
    artifacts: Artifacts,
    role: null | string,
    repository: string,
    task: string,
    fields: FormConstructor,
    destroy: () => undefined
  ) {
    super(formId, authRecord, artifacts, role, repository, fields, destroy);
    this.task = task;
    this.FormComponent = getTaskFormComponent(this);

    this.submit = (): void => {
      this.action('task');
    };
  }
}

export { TaskForm };
