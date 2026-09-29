# TanstackTable

`TanstackTable<TData>` 使用 TanStack Table v9 生成行、列、排序和展开模型，使用 Ant Design 呈现选择框和分页。页面通过 `TableContainer` 的 `title` 渲染 `TableToolbar`，列设置状态通过 `columnSettings` 和 `onColumnSettingsChange` 传入表格。

| 需求 | 配置 |
| --- | --- |
| 不选行 | 不传 `rowSelection` |
| 单选 | `rowSelection={{ type: 'radio', onChange }}` |
| 多选 | `rowSelection={{ type: 'checkbox', onChange }}` |
| 受控选择 | 额外传入 `selectedRowKeys`；跨页键由页面保存 |
| 表头搜索 | 在列上配置 `search: { value, onChange }`，由页面查询数据 |
| 本页排序 | 列上设置 `sortable: true` |
| 服务端排序 | 同时传入 `onSortChange`；组件不重排当前页，页面按新条件请求数据 |
| 列设置 | 页面在 `TableContainer title` 中渲染 `TableToolbar`，并把 `columnSettings`、`onColumnSettingsChange` 传给表格；工具栏支持显示、隐藏、拖动顺序、键盘方向键调整顺序及左右固定 |
| 自定义表头 | 列可通过 `renderHeader` 自定义整个表头；不自定义整个表头时，可分别用 `renderSort`、`renderSearch` 替换排序和搜索组件 |
| 列宽 | 默认可拖动，也可聚焦分隔条用方向键调整；`resizable: false` 可关闭某列调整 |
| 树形行 | `getSubRows={(row) => row.children}`，子行使用相同列结构 |
| 详情或子表格 | `renderExpandedRow={(row) => <TanstackTable ... />}`；可用 `rowExpandable` 限制可展开的行 |
| 行虚拟化 | `virtualize`；数据达到 100 行后只渲染视口附近的行，适用于高度一致且不包含树形或展开内容的列表 |

列的 `key` 应保持唯一且稳定；`rowKey` 在整棵树中应唯一。树形展开时，表头全选只作用于当前可见行。服务端分页由页面提供 `pagination` 与当前页的 `dataSource`，不会把当前页误当成完整数据集排序。
