import React from 'react';
import { BaseField, FieldInit } from '@sotaoi/client-forms/fields/base-field';
import { FieldValidation, BaseInput } from '@sotaoi/input/base-input';
import { BooleanInput } from '@sotaoi/input/boolean-input';
import { InputValidatorContract } from '@sotaoi/contracts/http/input-validator-contract';
import { Helper } from '@sotaoi/client/helper';

interface ComponentProps {
  onChange: (ev: any) => void;
  render: (value: boolean, setValue: (value: boolean) => void) => null | React.ReactElement;
  value: boolean;
}
interface ComponentState {
  value: boolean;
}
class BooleanField extends BaseField<BooleanInput, ComponentProps, ComponentState> {
  constructor(
    name: string,
    key: string,
    getFormValidation: () => InputValidatorContract<(key: string) => void | null | BaseInput<any, any>>,
    validations: FieldValidation[] = [],
    getRerender: () => (force: boolean) => void,
    value: BooleanInput
  ) {
    super(name, key, getFormValidation, validations, getRerender, value);
  }

  public init(): FieldInit {
    return {
      value: this.getInputValue(this.value),
      onChange: async (ev: any): Promise<void> => {
        this.setTouched(true);
        this.set(this.convert(ev.target.value));
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
    this.set(this.convert(false));
  }

  public isEmpty(): boolean {
    return !this.value;
  }

  public set(value: string | boolean | BooleanInput): void {
    this.value = this.convert(value);
    this._ref?.setValue(this.value);
  }

  public convert(value: string | boolean | BooleanInput): BooleanInput {
    return BooleanInput.convert(value);
  }

  public getInputValue(input: BooleanInput = this.value): boolean {
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

  public setValue(input: BooleanInput, context: React.Component<ComponentProps, ComponentState>): void {
    context.setState({ value: this.getInputValue(input) });
  }

  public getValue(context: React.Component<ComponentProps, ComponentState>): void {
    context.state.value;
  }

  public render(context: React.Component<ComponentProps, ComponentState>): null | React.ReactElement {
    if (Helper.isWeb()) {
      const setValue = (value: boolean): void => context.props.onChange({ target: { value } });
      return context.props.render(context.state.value, setValue);
    }
    if (Helper.isMobile()) {
      const setValue = (value: boolean): void => context.props.onChange({ target: { value } });
      return context.props.render(context.state.value, setValue);
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

export { BooleanField, BooleanInput };
