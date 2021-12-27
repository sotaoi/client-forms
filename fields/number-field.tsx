import React from 'react';
import { BaseField, FieldInit } from '@sotaoi/client-forms/fields/base-field';
import { FieldValidation, BaseInput } from '@sotaoi/input/base-input';
import { NumberInput } from '@sotaoi/input/number-input';
import { InputValidatorContract } from '@sotaoi/contracts/http/input-validator-contract';
import { Helper } from '@sotaoi/client/helper';

interface InputProps extends React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {
  onChange: (ev: any) => void;
  value: number;
  secureTextEntry?: boolean;
}
interface ComponentState {
  value: number;
}
class NumberField<ComponentProps = InputProps> extends BaseField<NumberInput, ComponentProps, ComponentState> {
  constructor(
    name: string,
    key: string,
    getFormValidation: () => InputValidatorContract<(key: string) => void | null | BaseInput<any, any>>,
    validations: FieldValidation[],
    getRerender: () => (force: boolean) => void,
    value: NumberInput
  ) {
    super(name, key, getFormValidation, validations, getRerender, value);
  }

  public init(): FieldInit {
    return {
      value: this.getInputValue(this.value),
      onChange: async (ev: any): Promise<void> => {
        this.set(this.convert(ev.target.value));
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

  public set(input: NumberInput): void {
    this.value = input;
    this._ref?.setValue(input);
  }

  public clear(): void {
    this.setTouched(true);
    throw new Error('number field cannot call "clear" method, no neutral value implemented');
    // this.setTouched(false);
    // this.set(new NumberInput(0));
  }

  public isEmpty(): boolean {
    return !this.getInputValue();
  }

  public convert(value: NumberInput | number): NumberInput {
    if (value instanceof NumberInput) {
      return value;
    }
    if (typeof value !== 'number') {
      throw new Error('number field cannot call "clear" method, no neutral value implemented');
    }
    return new NumberInput(value);
  }

  public getInputValue(input: NumberInput = this.value): number {
    return input.getValue();
  }

  public wasChanged(): boolean {
    return this.getInputValue() !== this.initialValue.getValue();
  }

  //

  public initialState(props: ComponentProps): ComponentState {
    return { value: (props as any).value.tonumber() };
  }

  public setValue(input: NumberInput, context: React.Component<ComponentProps, ComponentState>): void {
    context.setState({ value: input.getValue() });
  }

  public getValue(context: React.Component<ComponentProps, ComponentState>): number {
    return context.state.value;
  }

  public render(context: React.Component<ComponentProps, ComponentState>): null | React.ReactElement {
    if (Helper.isWeb()) {
      return <input {...context.props} value={context.state.value} />;
    }
    if (Helper.isMobile()) {
      throw new Error('Please update this section');
      // const { onChange, ..._props } = context.props as any;
      // return (
      //   <TextInput
      //     onChangeText={(value: number): void => onChange({ target: { value } })}
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
    return { ...state, value: (nextProps as any).value };
  }
}

export { NumberField, NumberInput };
