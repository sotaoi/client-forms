import React from 'react';
import { BaseField, FieldInit } from '@sotaoi/client-forms/fields/base-field';
import { FieldValidation, BaseInput } from '@sotaoi/input/base-input';
import { OptionsSelectInput, OptionsSelectValue } from '@sotaoi/input/options-select-input';
import { InputValidatorContract } from '@sotaoi/contracts/http/input-validator-contract';
import { Helper } from '@sotaoi/client/helper';

interface ComponentProps {
  onChange: (ev: any) => void;
  render: (
    values: OptionsSelectValue,
    onChange: (option: string, value: boolean) => () => void
  ) => null | React.ReactElement;
  value: OptionsSelectValue;
}
interface ComponentState {
  value: OptionsSelectValue;
}
class OptionsSelectField extends BaseField<OptionsSelectInput, ComponentProps, ComponentState> {
  public options: string[];

  constructor(
    name: string,
    key: string,
    getFormValidation: () => InputValidatorContract<(key: string) => void | null | BaseInput<any, any>>,
    validations: FieldValidation[] = [],
    getRerender: () => (force: boolean) => void,
    value: OptionsSelectInput
  ) {
    super(name, key, getFormValidation, validations, getRerender, value);
    this.options = this.value instanceof OptionsSelectInput ? Object.keys(this.getInputValue()) : [];
  }

  public init(): FieldInit {
    return {
      value: this.getInputValue(this.value),
      onChange: async (ev: any): Promise<void> => {
        const options = this.getInputValue();
        options[ev.target.value] = ev.target.checked;
        this.setTouched(true);
        this.set(this.convert(options));
        await this.validate();
        this.rerender(true);
      },
      onBlur: async (ev: any): Promise<void> => {
        //
      },
    };
  }

  public clear(): void {
    this.setTouched(true);
    const options: { [key: string]: boolean } = {};
    this.options.map((option) => (options[option] = false));
    this.set(this.convert(options));
  }

  public isEmpty(): boolean {
    return !this.value;
  }

  public set(value: string | OptionsSelectValue | OptionsSelectInput): void {
    this.value = this.convert(value);
    this._ref?.setValue(this.value);
  }

  public convert(value: string | OptionsSelectValue | OptionsSelectInput): OptionsSelectInput {
    return OptionsSelectInput.convert(value);
  }

  public getInputValue(input: OptionsSelectInput = this.value): OptionsSelectValue {
    return input.getValue();
  }

  public wasChanged(): boolean {
    // todo lowprio: implement
    return this.wasTouched();
  }

  //

  public initialState(props: ComponentProps): ComponentState {
    return { value: props.value };
  }

  public setValue(input: OptionsSelectInput, context: React.Component<ComponentProps, ComponentState>): void {
    context.setState({ value: this.getInputValue(input) });
  }

  public getValue(context: React.Component<ComponentProps, ComponentState>): void {
    context.state.value;
  }

  public render(context: React.Component<ComponentProps, ComponentState>): null | React.ReactElement {
    if (Helper.isWeb()) {
      const onChange = (option: string, value: boolean) => (): void =>
        context.props.onChange({ target: { checked: value, value: option } });
      return context.props.render(context.state.value, onChange);
    }
    if (Helper.isMobile()) {
      throw new Error('mobile is not implemented');
    }
    if (Helper.isElectron()) {
      throw new Error('electron is not implemented');
    }
    throw new Error('unknown environment ref select in component');
  }

  public static getDerivedStateFromProps(
    nextProps: { [key: string]: any },
    state: { [key: string]: any }
  ): null | { [key: string]: any } {
    return { ...state, value: (nextProps as any).value };
  }
}

export { OptionsSelectField, OptionsSelectInput };
