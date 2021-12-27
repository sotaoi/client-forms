import React from 'react';
import { BaseField, FieldInit } from '@sotaoi/client-forms/fields/base-field';
import { BaseInput, FieldValidation } from '@sotaoi/input/base-input';
import { StringInput } from '@sotaoi/input/string-input';
import { InputValidatorContract } from '@sotaoi/contracts/http/input-validator-contract';
import { Helper } from '@sotaoi/client/helper';
// import { KeyboardType, TextInput } from 'react-native';

interface InputProps extends React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {
  onChange: (ev: any) => void;
  value: string;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  // keyboardType?: KeyboardType;
  keyboardType?: any;
  secureTextEntry?: boolean;
}
interface ComponentState {
  value: null | string;
}
class InputField<ComponentProps extends InputProps> extends BaseField<StringInput, ComponentProps, ComponentState> {
  constructor(
    name: string,
    key: string,
    getFormValidation: () => InputValidatorContract<(key: string) => void | null | BaseInput<any, any>>,
    validations: FieldValidation[],
    getRerender: () => (force: boolean) => void,
    value: StringInput
  ) {
    super(name, key, getFormValidation, validations, getRerender, value);
  }

  public init(): FieldInit {
    return {
      value: this.getInputValue(this.value || null),
      onChange: async (ev: any): Promise<void> => {
        this.set(this.convert(ev.target.value || null));
        await this.validate();
        this.rerender(true);
      },
      onBlur: async (ev: any): Promise<void> => {
        this.setTouched(true);
        await this.validate();
        this.rerender(true);
      },
    };
  }

  public set(input: StringInput): void {
    this.value = input || null;
    this._ref?.setValue(input || null);
  }

  public clear(): void {
    this.setTouched(true);
    this.set(new StringInput(null));
  }

  public isEmpty(): boolean {
    return !this.getInputValue();
  }

  public convert(value: StringInput | null | string): StringInput {
    if (value instanceof StringInput) {
      return value;
    }
    return new StringInput(typeof value === 'string' ? value : null);
  }

  public getInputValue(input: StringInput = this.value): null | string {
    return input.getValue();
  }

  public wasChanged(): boolean {
    return this.getInputValue() !== this.initialValue.getValue();
  }

  //

  public initialState(props: ComponentProps): ComponentState {
    return { value: props.value ? props.value.toString() : null };
  }

  public setValue(input: StringInput, context: React.Component<ComponentProps, ComponentState>): void {
    context.setState({ value: input.getValue() });
  }

  public getValue(context: React.Component<ComponentProps, ComponentState>): null | string {
    return context.state.value || null;
  }

  public render(context: React.Component<ComponentProps, ComponentState>): null | React.ReactElement {
    if (Helper.isWeb()) {
      return <input {...context.props} value={context.state.value ?? ''} />;
    }
    if (Helper.isMobile()) {
      return null;
      // const autoCapitalize = context.props.autoCapitalize || 'none';
      // const keyboardType = context.props.keyboardType || 'default';
      // const secureTextEntry = context.props.secureTextEntry || false;
      // const { onChange, ..._props } = context.props as any;
      // return (
      //   <TextInput
      //     autoCapitalize={autoCapitalize}
      //     keyboardType={keyboardType}
      //     secureTextEntry={secureTextEntry}
      //     onChangeText={(value: string): void => onChange({ target: { value } })}
      //     {...(_props as any)}
      //     value={context.state.value}
      //   />
      // );
    }
    if (Helper.isElectron()) {
      throw new Error('electron is not implemented');
    }
    throw new Error('unknown environment in input component');
  }

  public static getDerivedStateFromProps(
    nextProps: { [key: string]: any },
    state: { [key: string]: any }
  ): null | { [key: string]: any } {
    return { ...state, value: (nextProps as any).value || null };
  }
}

export { InputField };
export { StringInput } from '@sotaoi/input/string-input';
