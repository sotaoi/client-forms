import React from 'react';
import { BaseField, FieldInit } from '@sotaoi/client-forms/fields/base-field';
import { FieldValidation, BaseInput } from '@sotaoi/input/base-input';
import { MultiFileInput, MultiFileFieldType } from '@sotaoi/input/multi-file-input';
import { FileInput, StoredItem } from '@sotaoi/input/file-input';
import { InputValidatorContract } from '@sotaoi/contracts/http/input-validator-contract';
import { Helper } from '@sotaoi/client-helper';

interface ComponentProps
  extends React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {
  value: any;
}
interface ComponentState {
  value: File[];
}
class MultiFileField extends BaseField<MultiFileInput, ComponentProps, ComponentState> {
  public ref: null | HTMLInputElement;

  constructor(
    name: string,
    key: string,
    getFormValidation: () => InputValidatorContract<(key: string) => void | null | BaseInput<any, any>>,
    validations: FieldValidation[],
    getRerender: () => (force: boolean) => void,
    value: MultiFileInput
  ) {
    super(name, key, getFormValidation, validations, getRerender, value);
    this.ref = null;
  }

  public init(): FieldInit {
    return {
      value: this.getInputValue(this.value),
      onChange: async (ev: any): Promise<void> => {
        this.setTouched(true);
        if (!ev.target.files.length) {
          this.set([]);
          await this.validate();
          this.rerender(true);
          return;
        }
        this.set(ev.target.files);
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
    this.set([]);
    this.rerender(true);
  }

  public isEmpty(): boolean {
    return this.value.isEmpty();
  }

  public set(value: [] | MultiFileInput): void {
    this.value = this.convert(value);
    this._ref?.setValue(this.value);
  }

  public convert(value: null | string | MultiFileInput | MultiFileFieldType): MultiFileInput {
    if (!value || (value instanceof Array && !value.length)) {
      return new MultiFileInput([]);
    }
    if (typeof value === 'string') {
      const fileInputs = JSON.parse(value).map((asset: StoredItem) => new FileInput('', '', asset, null, null));
      return new MultiFileInput(fileInputs);
    }
    if (value instanceof MultiFileInput) {
      return value;
    }
    if (value instanceof FileList) {
      const input = new MultiFileInput([]);
      for (let i = 0; i < value.length; i++) {
        input.append(new FileInput('', value[i].name, null, URL.createObjectURL(value[i]), value[i]));
      }
      return input;
    }
    throw new Error('multi file convert error');
  }

  public getInputValue(input: MultiFileInput = this.value): FileInput[] {
    return input.getValue();
  }

  public wasChanged(): boolean {
    // todo lowprio: implement
    return this.wasTouched();
  }

  public getPreviews(): string[] {
    return this.getInputValue().map((fileInput) => fileInput.getPreview());
  }

  public initialState(props: ComponentProps): ComponentState {
    return { value: props.value };
  }

  public setValue(input: MultiFileInput, context: React.Component<ComponentProps, ComponentState>): void {
    if (!input.getValue().length) {
      this.ref && (this.ref.value = '');
      context.setState({ value: [] });
      return;
    }
    context.setState({ value: input.getFiles() });
  }

  public getValue(context: React.Component<ComponentProps, ComponentState>): File[] {
    return context.state.value;
  }

  public render(context: React.Component<ComponentProps, ComponentState>): null | React.ReactElement {
    if (Helper.isWeb()) {
      const { value, ..._props } = context.props;
      return (
        <input
          type={'file'}
          multiple={true}
          ref={(ref): null | HTMLInputElement => ref && (this.ref = ref)}
          {..._props}
        />
      );
    }
    if (Helper.isMobile()) {
      throw new Error('mobile is not implemented');
    }
    if (Helper.isElectron()) {
      throw new Error('electron is not implemented');
    }
    throw new Error('unknown environment in multi file component');
  }

  public static getDerivedStateFromProps(
    nextProps: { [key: string]: any },
    state: { [key: string]: any }
  ): null | { [key: string]: any } {
    return { ...state, value: (nextProps as any).value };
  }
}

export { MultiFileField, MultiFileInput };
