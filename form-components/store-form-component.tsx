import React from 'react';
import { StoreForm } from '@sotaoi/client-forms/form-classes/store-form';
import { Helper } from '@sotaoi/client/helper';

const getStoreFormComponent =
  (form: StoreForm): React.FunctionComponent<any> =>
  (props: { children: any; formStyle?: React.CSSProperties; noFormElement?: boolean }): React.ReactElement =>
    (
      <StoreFormComponent form={form} formStyle={props.formStyle || {}} showFormElement={!props.noFormElement}>
        {props.children}
      </StoreFormComponent>
    );

const StoreFormComponent = (props: {
  children: any;
  form: StoreForm;
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
            props.form.getFormState().canSubmit && props.form.action('store');
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

export { getStoreFormComponent };
