import React from 'react';
import { BaseField, FieldInit } from '@sotaoi/client-forms/fields/base-field';
import { RecordRef } from '@sotaoi/contracts/artifacts';
import { FieldValidation, BaseInput } from '@sotaoi/input/base-input';
import { RefSelectInput, RefSelectValue } from '@sotaoi/input/ref-select-input';
import { InputValidatorContract } from '@sotaoi/contracts/http/input-validator-contract';
import { Helper } from '@sotaoi/client/helper';
// import { Picker } from 'react-native-picker/picker';

interface ComponentProps
  extends React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLSelectElement>, HTMLSelectElement> {
  onChange: (ev: any) => void;
  style?: { [key: string]: any };
  value: string;
}
interface ComponentState {
  value: string;
}
class RefSelectField extends BaseField<RefSelectInput, ComponentProps, ComponentState> {
  public webRef: null | HTMLSelectElement;
  // public mobileRef: null | Picker<any>;
  public mobileRef: any;

  constructor(
    name: string,
    key: string,
    getFormValidation: () => InputValidatorContract<(key: string) => void | null | BaseInput<any, any>>,
    validations: FieldValidation[] = [],
    getRerender: () => (force: boolean) => void,
    value: RefSelectInput
  ) {
    super(name, key, getFormValidation, validations, getRerender, value);
    this.webRef = null;
    this.mobileRef = null;
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
    this.set(this.convert(null));
  }

  public isEmpty(): boolean {
    return !this.value;
  }

  public set(value: RefSelectInput | string): void {
    this.value = this.convert(value);
    this._ref?.setValue(this.value);
  }

  public convert(value: RefSelectInput | null | string): RefSelectInput {
    if (!value || typeof value === 'string') {
      return new RefSelectInput(typeof value === 'string' ? RecordRef.deserialize(value) : null);
    }
    if (value instanceof RecordRef) {
      return new RefSelectInput(value);
    }
    if (value instanceof RefSelectInput) {
      return value;
    }
    throw new Error('ref convert error');
  }

  public getInputValue(input: RefSelectInput = this.value): RefSelectValue {
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

  public setValue(input: RefSelectInput, context: React.Component<ComponentProps, ComponentState>): void {
    context.setState({ value: this.getInputValue(input)?.serialize() || '' });
  }

  public getValue(context: React.Component<ComponentProps, ComponentState>): void {
    context.state.value;
  }

  public render(context: React.Component<ComponentProps, ComponentState>): null | React.ReactElement {
    if (Helper.isWeb()) {
      let { ...props } = context.props;
      return (
        <select
          ref={(ref): null | HTMLSelectElement => ref && (this.webRef = ref)}
          {...props}
          style={{ ...(props.style || {}) }}
          value={context.state.value}
        >
          {props.children}
        </select>
      );
    }
    if (Helper.isMobile()) {
      throw new Error('Please update this section');
      // const { onChange, ...props } = context.props;
      // return (
      //   <Picker
      //     ref={(ref): null | Picker<any> => ref && (this.mobileRef = ref)}
      //     selectedValue={context.state.value}
      //     onValueChange={(value: any, index: number): void => onChange({ target: { value } })}
      //     style={{ ...(props.style || {}) }}
      //   >
      //     {props.children}
      //   </Picker>
      // );
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

export { RefSelectField, RefSelectInput };
