import {
  DownOutlined,
  ReloadOutlined,
  SearchOutlined,
  UpOutlined
} from '@ant-design/icons'
import { Button, Col, DatePicker, Form, Input, Row, Select, Space } from 'antd'
import type { ColProps } from 'antd'
import { useEffect, useId, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type {
  QueryFormField,
  QueryFormProps,
  QuerySelectField,
  QuerySelectOptions
} from '@/components/queryForm/type'
import { getVisibleQueryFields } from '@/components/queryForm/utils'

export type * from '@/components/queryForm/type'

const defaultColProps: ColProps = {
  xs: 24,
  sm: 12,
  xl: 6,
  style: { flexWrap: 'nowrap' }
}

const responsiveLabelCol: ColProps = {
  xs: { span: 8 },
  sm: { span: 12 },
  md: { span: 8 },
  lg: { span: 10 },
  xl: { span: 8 },
  xxl: { span: 6 },
  xxxl: { span: 5 }
}

const responsiveWrapperCol: ColProps = {
  xs: { span: 16 },
  sm: { span: 12 },
  md: { span: 16 },
  lg: { span: 14 },
  xl: { span: 16 },
  xxl: { span: 18 },
  xxxl: { span: 19 }
}

function getFieldKey<Values extends object>(field: QueryFormField<Values>) {
  return field.key ?? JSON.stringify(field.name)
}

type QueryFieldType<Values extends object> = QueryFormField<Values>['type']

type QueryFieldRendererMap<Values extends object> = {
  [Type in QueryFieldType<Values>]: (
    field: Extract<QueryFormField<Values>, { type: Type }>
  ) => ReactNode
}

function renderQueryField<Values extends object>(
  field: QueryFormField<Values>,
  renderers: QueryFieldRendererMap<Values>
) {
  const renderer = renderers[field.type] as (
    currentField: QueryFormField<Values>
  ) => ReactNode

  return renderer(field)
}

export function QueryForm<Values extends object>({
  fields,
  form: externalForm,
  formProps,
  rowProps,
  actionColProps,
  initialValues,
  values,
  collapsedCount = 3,
  defaultExpanded = false,
  expanded,
  loading = false,
  name = 'query-form',
  submitText = '查询',
  resetText = '重置',
  extraActions,
  onExpandedChange,
  onFinish,
  onReset,
  onValuesChange,
  onOptionsLoadError
}: QueryFormProps<Values>) {
  const {
    gutter: rowGutter = [48, 16],
    style: rowStyle,
    ...rowAttributes
  } = rowProps ?? {}
  const { style: actionColStyle, ...actionColAttributes } = actionColProps ?? {}
  const [innerForm] = Form.useForm<Values>()
  const form = externalForm ?? innerForm
  const [innerExpanded, setInnerExpanded] = useState(defaultExpanded)
  const [remoteOptions, setRemoteOptions] = useState<
    Record<string, QuerySelectOptions>
  >({})
  const [optionsLoading, setOptionsLoading] = useState<Record<string, boolean>>(
    {}
  )
  const [optionsError, setOptionsError] = useState<Record<string, boolean>>({})
  const loadingKeys = useRef(new Set<string>())
  const mounted = useRef(true)
  const formId = `${name}-${useId()}`
  const formLayout = formProps?.layout ?? 'inline'
  const isExpanded = expanded ?? innerExpanded
  const visibleFields = getVisibleQueryFields(
    fields,
    isExpanded,
    collapsedCount
  )
  const hasMoreFields = fields.length > Math.max(0, collapsedCount)

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  useEffect(() => {
    if (values) {
      form.setFieldsValue(values)
    }
  }, [form, values])

  function changeExpanded(nextExpanded: boolean) {
    if (expanded === undefined) {
      setInnerExpanded(nextExpanded)
    }
    onExpandedChange?.(nextExpanded)
  }

  async function loadSelectOptions(field: QuerySelectField<Values>) {
    const fieldKey = String(getFieldKey(field))

    if (
      !field.requestOptions ||
      Object.hasOwn(remoteOptions, fieldKey) ||
      loadingKeys.current.has(fieldKey)
    ) {
      return
    }

    loadingKeys.current.add(fieldKey)
    setOptionsLoading((current) => ({ ...current, [fieldKey]: true }))
    setOptionsError((current) => ({ ...current, [fieldKey]: false }))

    try {
      const options = await field.requestOptions()
      if (mounted.current) {
        setRemoteOptions((current) => ({ ...current, [fieldKey]: options }))
      }
    } catch (error) {
      if (mounted.current) {
        setOptionsError((current) => ({ ...current, [fieldKey]: true }))
        onOptionsLoadError?.(error, field)
      }
    } finally {
      loadingKeys.current.delete(fieldKey)
      if (mounted.current) {
        setOptionsLoading((current) => ({ ...current, [fieldKey]: false }))
      }
    }
  }

  function renderSelectField(field: QuerySelectField<Values>) {
    const fieldKey = String(getFieldKey(field))
    const fieldLoading = optionsLoading[fieldKey] ?? false
    const handleOpenChange = field.props?.onOpenChange

    return (
      <Select
        {...field.props}
        options={remoteOptions[fieldKey] ?? field.options}
        loading={fieldLoading || field.props?.loading}
        notFoundContent={
          optionsError[fieldKey]
            ? '选项加载失败，请重新打开'
            : field.props?.notFoundContent
        }
        onOpenChange={(open) => {
          handleOpenChange?.(open)
          if (open) {
            void loadSelectOptions(field)
          }
        }}
      />
    )
  }

  const fieldRenderers = {
    input: (field) => <Input {...field.props} />,
    select: renderSelectField,
    date: (field) => (
      <DatePicker
        {...field.props}
        style={{ width: '100%', ...field.props?.style }}
      />
    ),
    dateRange: (field) => (
      <DatePicker.RangePicker
        {...field.props}
        style={{ width: '100%', ...field.props?.style }}
      />
    ),
    custom: (field) => field.render({ field, form })
  } satisfies QueryFieldRendererMap<Values>

  function handleReset() {
    form.resetFields()
    onReset?.(form.getFieldsValue(true))
  }

  return (
    <Form<Values>
      labelCol={responsiveLabelCol}
      wrapperCol={responsiveWrapperCol}
      labelWrap
      {...formProps}
      form={form}
      initialValues={initialValues}
      layout={formLayout}
      name={name}
      onFinish={onFinish}
      onValuesChange={onValuesChange}
    >
      <Row
        {...rowAttributes}
        id={formId}
        gutter={rowGutter}
        style={{ width: '100%', ...rowStyle }}
      >
        {visibleFields.map((field) => (
          <Col
            {...defaultColProps}
            {...field.colProps}
            key={getFieldKey(field)}
          >
            <Form.Item
              {...field.formItemProps}
              label={field.label}
              name={field.name}
              style={{
                marginBottom: 0,
                marginInlineEnd: 0,
                width: '100%',
                ...field.formItemProps?.style
              }}
            >
              {renderQueryField(field, fieldRenderers)}
            </Form.Item>
          </Col>
        ))}

        <Col
          {...defaultColProps}
          {...actionColAttributes}
          style={actionColStyle}
        >
          <Form.Item
            label={null}
            wrapperCol={{ span: 24 }}
            style={{ marginBottom: 0, marginInlineEnd: 0, width: '100%' }}
          >
            <Space size="small">
              <Button
                type="primary"
                htmlType="submit"
                icon={<SearchOutlined />}
                loading={loading}
              >
                {submitText}
              </Button>
              <Button
                icon={<ReloadOutlined />}
                disabled={loading}
                onClick={handleReset}
              >
                {resetText}
              </Button>
              {extraActions}
              {hasMoreFields ? (
                <Button
                  type="link"
                  icon={isExpanded ? <UpOutlined /> : <DownOutlined />}
                  aria-controls={formId}
                  aria-expanded={isExpanded}
                  onClick={() => changeExpanded(!isExpanded)}
                  iconPlacement="end"
                  className="!p-0"
                >
                  {isExpanded ? '收起' : '展开'}
                </Button>
              ) : null}
            </Space>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  )
}
