import React from 'react';
import { InputField } from '@sotaoi/client-forms/fields/input-field';
import { Helper } from '@sotaoi/client/helper';

interface ComponentProps
  extends React.DetailedHTMLProps<React.TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement> {
  onChange: (ev: any) => void;
  value: string;
  secureTextEntry?: boolean;
}
interface ComponentState {
  value: string;
}
class TextField extends InputField<ComponentProps | any> {
  public render(context: React.Component<ComponentProps, ComponentState>): null | React.ReactElement {
    if (Helper.isWeb()) {
      return <textarea {...context.props} value={context.state.value} />;
    }
    if (Helper.isMobile()) {
      throw new Error('mobile is not implemented');
    }
    if (Helper.isElectron()) {
      throw new Error('electron is not implemented');
    }
    throw new Error('unknown environment in text component');
  }
}

export { TextField };
export { StringInput } from '@sotaoi/input/string-input';
