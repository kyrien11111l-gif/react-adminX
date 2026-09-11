import { DatePicker } from 'antd'
import type {
  ColProps,
  FormInstance,
  FormItemProps,
  FormProps,
  InputProps,
  RowProps,
  SelectProps
} from 'antd'
import type { ComponentProps, ReactNode } from 'react'

type QueryFieldName<Values extends object> = NonNullable<
  FormItemProps<Values>['name']
>

export type QuerySelectOptions = NonNullable<SelectProps['options']>
export type QueryDatePickerProps = ComponentProps<typeof DatePicker>
export type QueryRangePickerProps = ComponentProps<typeof DatePicker.RangePicker>
export type QueryDateRangeValue = QueryRangePickerProps['value']

export interface QueryFieldBase<Values extends object> {
  key?: string
  label: ReactNode
  name: QueryFieldName<Values>
  colProps?: Omit<ColProps, 'children'>
  formItemProps?: Omit<FormItemProps<Values>, 'children' | 'label' | 'name'>
}

export interface QueryInputField<Values extends object>
  extends QueryFieldBase<Values> {
  type: 'input'
  props?: InputProps
}

export interface QuerySelectField<Values extends object>
  extends QueryFieldBase<Values> {
  type: 'select'
  options?: QuerySelectOptions
  requestOptions?: () => Promise<QuerySelectOptions>
  props?: SelectProps
}

export interface QueryDateField<Values extends object>
  extends QueryFieldBase<Values> {
  type: 'date'
  props?: QueryDatePickerProps
}

export interface QueryDateRangeField<Values extends object>
  extends QueryFieldBase<Values> {
  type: 'dateRange'
  props?: QueryRangePickerProps
}

export interface QueryCustomField<Values extends object>
  extends QueryFieldBase<Values> {
  type: 'custom'
  render: (context: {
    field: QueryCustomField<Values>
    form: FormInstance<Values>
  }) => ReactNode
}

export type QueryFormField<Values extends object> =
  | QueryInputField<Values>
  | QuerySelectField<Values>
  | QueryDateField<Values>
  | QueryDateRangeField<Values>
  | QueryCustomField<Values>

export interface QueryFormProps<Values extends object> {
  fields: QueryFormField<Values>[]
  form?: FormInstance<Values>
  formProps?: Omit<
    FormProps<Values>,
    'children' | 'form' | 'initialValues' | 'name' | 'onFinish' | 'onValuesChange'
  >
  rowProps?: Omit<RowProps, 'children'>
  actionColProps?: Omit<ColProps, 'children'>
  initialValues?: Partial<Values>
  values?: Partial<Values>
  collapsedCount?: number
  defaultExpanded?: boolean
  expanded?: boolean
  loading?: boolean
  name?: string
  submitText?: string
  resetText?: string
  extraActions?: ReactNode
  onExpandedChange?: (expanded: boolean) => void
  onFinish: NonNullable<FormProps<Values>['onFinish']>
  onReset?: (values: Values) => void
  onValuesChange?: FormProps<Values>['onValuesChange']
  onOptionsLoadError?: (
    error: unknown,
    field: QuerySelectField<Values>
  ) => void
}
