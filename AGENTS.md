# AGENTS.md

本文档是 admin-core 项目的协作约定。修改代码前先阅读本文件，并以当前仓库中的实现、package.json 和测试为准，不要依据旧文档或个人记忆推断项目结构。

## 项目定位

这是一个使用 React、Vite、TypeScript、React Router、Zustand 和 Ant Design 构建的后台管理系统基础项目，重点提供：

- 登录、会话失效和统一退出登录
- 服务端菜单驱动的动态路由
- 基于路由元数据和权限码的访问控制
- 响应式侧边栏、面包屑、标签页和内容全屏
- Ant Design 浅色/深色主题切换
- 可切换的 Mock API 和真实 API

当前项目不是完整的业务后端。src/mocks 中的接口仅用于本地演示和自动化测试，接入真实服务时应保持前端 API 契约不变。

## 技术基线

- Node.js 20+
- pnpm
- React 19
- Vite 8
- TypeScript 6
- Ant Design 6.6.1 与 @ant-design/icons 6.3.2
- React Router 7
- Zustand 5
- Tailwind CSS 4

Ant Design CLI 要求 Node.js 20 或更高版本。依赖的精确安装版本以 pnpm-lock.yaml 为准，声明版本和脚本以 package.json 为准。

## 开发前置：Ant Design

Ant Design 版本可能包含破坏性变更。编写或修改任何 Ant Design 组件代码前，必须阅读：

1. [Ant Design For Agents](https://ant.design/docs/react/for-agents/)
2. [Ant Design CLI 中文文档](https://ant.design/docs/react/cli-cn/)
3. [仓库内 Ant Design CLI Skill](.agents/skills/antd/SKILL.md)

项目使用 Ant Design 6.6.1。涉及组件 API、Token、语义化样式或迁移时，优先用本地 CLI 查询当前版本，不要猜测 API：

~~~
pnpm exec antd info Button --version 6.6.1 --format json
pnpm exec antd doc Table --version 6.6.1 --lang zh
pnpm exec antd token --version 6.6.1 --format json
pnpm exec antd semantic Table --version 6.6.1 --format json
~~~

修改完成后运行：

~~~
pnpm lint:antd
~~~

CLI 的结构化输出统一使用 --format json。如果需要分析现有用法，使用 pnpm exec antd usage ./src --format json；如果需要诊断依赖或兼容性，使用 pnpm exec antd doctor --format json。

## 常用命令

~~~
pnpm install
pnpm dev
pnpm lint
pnpm test
pnpm build
pnpm preview
pnpm lint:antd
~~~

提交代码前至少执行 pnpm lint、pnpm test 和 pnpm build。涉及 Ant Design 代码时，再执行 pnpm lint:antd。

## 编码规范

- JavaScript、TypeScript、JSX 和 TSX 不使用分号。
- 对象、数组、函数参数、导入列表和导出列表的最后一项不使用尾随逗号。
- 项目内部模块统一使用 @ 路径别名，例如 @/api、@/stores，禁止使用 ./ 或 ../ 引入项目内部模块。
- 保持 TypeScript 严格模式，避免使用 any；不要通过关闭类型检查来绕过问题。
- 保持现有 ESLint、Prettier 和 tsconfig 约束，不要为了局部代码改变全局规则。
- React 组件优先使用函数组件和显式类型；页面默认导出，基础设施模块按现有命名导出。
- 新增可复用的类型放入 src/types，不要在多个页面复制同一份接口定义。
- 用户可见文本使用中文，代码标识符、接口字段和权限码保持已有约定。
- 优先使用 Ant Design Token、theme.useToken() 和组件语义化样式；不要为同一套主题重新硬编码一套颜色系统。
- 保持键盘操作、可见焦点、语义化标签和 aria-label。新增交互控件时同时考虑窄屏和减少动态效果场景。

## 目录职责

~~~
src/
├── api/          业务 API 函数，只描述登录、用户、菜单和权限接口
├── components/   跨页面复用组件
├── layouts/      RootLayout、PageLayout、页头、侧栏和标签页
├── mocks/        本地 Mock fetch 和演示数据
├── pages/        页面组件，动态菜单的 component 字段映射到这里
├── router/       静态路由、动态路由、鉴权守卫和路由辅助模块
├── services/     通用请求封装和 401 处理
├── stores/       auth、user、permission、layout、tabs 状态
├── styles/       全局样式和 Tailwind 入口
├── types/        共享 TypeScript 类型
└── utils/        storage、会话、菜单、权限和启动 Loading 工具
~~~

测试位于 tests/，覆盖路由生成、路由注册、白名单、会话清理和标签页状态。design-system/ 目前是预留目录，不要把业务页面放入其中。

## 路由与权限规则

路由入口是 src/router/index.ts。根路由 root 渲染 RootLayout，静态路由和动态路由都挂在根路由下；项目没有名为 app 的动态路由锚点。

- src/router/config/baseRoutes.ts 维护固定路由：工作台、登录页、白名单测试页、403 和通配回退页。
- src/router/config/whiteList.ts 维护无需鉴权的路径。
- src/router/guards/authGuard.tsx 统一处理 token、初始化、回跳、401 后重定向和权限校验。
- src/router/dynamic/generateRoutes.ts 将菜单递归转换为 React Router 路由。
- src/router/dynamic/componentLoader.ts 是唯一的页面动态加载入口，组件字段 system/user/index 对应 src/pages/system/user/index.tsx。
- src/router/dynamic/routeRegistry.ts 是唯一调用 router.patchRoutes() 的位置，动态路由注册后需要重新匹配当前地址。
- 没有 permission 的路由默认允许访问；有 permission 的路由必须出现在服务端返回的权限数组中，否则跳转 /403。
- meta.layout 为 default 或省略时，页面通过 PageLayout 渲染；为 fullpage 时直接渲染业务页面，不显示侧栏、页头和标签页。
- 菜单的 hidden 只影响导航展示，不等于撤销 URL 访问权限；真正的访问控制由路由权限码完成。
- 目录菜单可以有 children，不应给纯目录强行添加页面组件；叶子菜单才需要 component。

新增动态页面时，按以下顺序处理：

1. 在 src/pages/{path}/index.tsx 创建页面。
2. 在 src/mocks/menu.ts 或真实菜单服务中添加对应的 component、path 和 meta。
3. 需要鉴权时设置 meta.permission，并在权限接口返回相同权限码。
4. 不要在页面中手动注册动态路由，也不要在页面中自行读取 token 或处理 401。
5. 为路由生成、权限或会话行为补充测试。

## 状态、会话与请求

- 页面只能通过 src/api 调用业务接口；通用请求逻辑统一位于 src/services/request.ts。
- 请求层负责拼接 VITE_API_PROXY_URL、注入 Bearer token、解析统一响应和处理 401。
- src/mocks/index.ts 仅在 VITE_USE_MOCK=true 时替代原生 fetch。
- token 通过 useAuthStore 持久化到 localStorage；用户、菜单和权限不持久化，刷新后重新初始化。
- 标签页持久化；布局仅持久化侧栏折叠和主题偏好，内容全屏状态不持久化。
- 退出登录和接口 401 必须调用 resetSession()，一次性清理 auth、user、permission 和 tabs 状态。
- 不要在页面组件中重复实现 token 清理、登录跳转、权限判断或请求错误解析。

## 环境变量与 Mock

.env.development 默认配置：

~~~
VITE_API_PROXY_URL=/api
VITE_USE_MOCK=true
~~~

.env.production 默认配置：

~~~
VITE_API_PROXY_URL=/api
VITE_USE_MOCK=false
~~~

接入真实后端时，通过对应模式的 .env 文件设置 API 前缀并关闭 Mock。不要将密钥、真实 token 或个人数据写入仓库；本地专用配置使用被忽略的 .env.local 文件。

当前 Mock 接口：

- POST /login：登录，演示账号 admin / 123456
- GET /user/info：当前用户
- GET /menus：菜单树
- GET /permissions：权限码数组

除登录接口外，Mock 请求要求 Authorization: Bearer mock-token。统一响应格式是 { code, message, data }，成功码为 0 或字符串 '0'。

## 验收要求

完成一项修改后，应确认：

- 没有引入相对路径、分号或尾随逗号。
- 动态路由、白名单、权限码和页面 component 路径仍然一致。
- 401 能清理完整会话并回到登录页。
- 页面在桌面端和窄屏下可用，键盘操作和减少动态效果场景没有明显回归。
- pnpm lint、pnpm test、pnpm build 均通过；涉及 Ant Design 时 pnpm lint:antd 也通过。
