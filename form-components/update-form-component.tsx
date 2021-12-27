import React from 'react';
import { UpdateForm } from '@sotaoi/client-forms/form-classes/update-form';
import { Helper } from '@sotaoi/client/helper';

const getUpdateFormComponent =
  (form: UpdateForm): React.FunctionComponent<any> =>
  (props: { children: any; formStyle?: React.CSSProperties; noFormElement?: boolean }): React.ReactElement =>
    (
      <UpdateFormComponent form={form} formStyle={props.formStyle || {}} showFormElement={!props.noFormElement}>
        {props.children}
      </UpdateFormComponent>
    );

const UpdateFormComponent = (props: {
  children: any;
  form: UpdateForm;
  formStyle: React.CSSProperties;
  showFormElement: boolean;
}): React.ReactElement => {
  switch (true) {
    case Helper.isWeb():
      if (!props.showFormElement) {
        return props.children;
      }
      return (
        <form
          action={'/'}
          method={'POST'}
          onSubmit={(ev): false => {
            ev.preventDefault();
            props.form.getFormState().canSubmit && props.form.action('update');
            return false;
          }}
          style={props.formStyle}
        >
          {props.children}
        </form>
      );
    case Helper.isMobile():
      return <React.Fragment>{props.children}</React.Fragment>;
    case Helper.isElectron():
      return <React.Fragment>{props.children}</React.Fragment>;
    default:
      throw new Error('Unknown environment');
  }
};

export { getUpdateFormComponent };
