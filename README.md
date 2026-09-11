# Admin Core

基于 React、Vite、TypeScript、React Router、Zustand 和 Ant Design 6 的后台管理系统基础项目。项目把登录会话、动态菜单、权限路由、响应式布局和 Mock API 组织成一套可继续扩展的前端骨架。

当前示例使用本地 Mock 数据，不包含真实后端服务。

## 功能概览

- Ant Design 6.6.1 中文界面、浅色/深色/跟随系统主题和可配置主色
- 设置抽屉支持侧边导航、顶部导航、双列导航和混合导航布局
- 登录、token 持久化、401 会话失效和统一退出登录
- 服务端菜单驱动的动态路由与按需加载页面
- 路由元数据权限校验和 /403 无权限页
- 桌面端侧栏、移动端 Drawer 导航、面包屑和路由标签页
- 可在设置抽屉中启用水印并修改水印内容
- 标签页关闭、关闭其他、关闭全部、刷新当前页和内容全屏
- Vite 环境变量控制 Mock/真实 API
- Vitest 路由、权限、会话和标签页测试
- ESLint、TypeScript/Vite 构建和 Ant Design CLI 检查

## 快速开始

环境要求：Node.js 20+、pnpm。

~~~
pnpm install
pnpm dev
~~~

打开终端输出的本地地址即可访问。默认演示账号：

~~~
用户名：admin
密码：123456
~~~

生产构建与本地预览：

~~~
pnpm build
pnpm preview
~~~

## 常用命令

| 命令 | 作用 |
| --- | --- |
| pnpm dev | 启动 Vite 开发服务器 |
| pnpm build | 类型检查并构建生产文件到 dist/ |
| pnpm preview | 预览生产构建 |
| pnpm lint | 执行 ESLint，禁止 warning |
| pnpm test | 执行 Vitest 测试 |
| pnpm lint:antd | 使用 Ant Design CLI 6.6.1 检查废弃 API、无障碍和最佳实践 |

提交前建议执行：

~~~
pnpm lint
pnpm test
pnpm build
pnpm lint:antd
~~~

## 技术栈

| 类别 | 选择 |
| --- | --- |
| UI | Ant Design 6.6.1、@ant-design/icons |
| 前端框架 | React 19、TypeScript 6 |
| 构建 | Vite 8、Tailwind CSS 4 |
| 路由 | React Router 7 |
| 状态 | Zustand 5 |
| 测试 | Vitest、jsdom |
| 工具 | ESLint、@ant-design/cli |

## 环境变量

Vite 会根据运行模式读取环境文件：

| 文件 | VITE_API_PROXY_URL | VITE_USE_MOCK | VITE_WATERMARK_ENABLED | VITE_WATERMARK_CONTENT | 用途 |
| --- | --- | --- | --- | --- | --- |
| .env.development | /api | true | true | Admin Core | 本地开发，使用 Mock |
| .env.production | /api | false | true | Admin Core | 生产构建，调用真实 API |

接入后端时，修改对应环境文件或创建本地专用的 .env.local：

~~~
VITE_API_PROXY_URL=https://api.example.com
VITE_USE_MOCK=false
VITE_WATERMARK_ENABLED=true
VITE_WATERMARK_CONTENT=内部系统
~~~

`VITE_WATERMARK_ENABLED` 设为 `true` 时开启全局水印，水印文字由 `VITE_WATERMARK_CONTENT` 设置；设为 `false` 或将文字留空时不渲染水印。修改环境文件后需要重新启动开发服务。

不要把密钥、真实 token 或个人数据提交到仓库。生产部署使用 Browser Router，服务器需要把未知前端路径回退到 index.html，否则直接刷新动态页面可能返回 404。

## 目录结构

~~~
.
├── AGENTS.md              # 面向代码 Agent 的项目约定
├── README.md              # 项目说明
├── package.json           # 依赖与脚本
├── vite.config.ts         # Vite、路径别名和 Vitest 配置
├── src/
│   ├── api/               # 登录、用户、菜单和权限 API
│   ├── components/        # 跨页面复用组件
│   ├── layouts/
│   │   ├── rootLayout/    # 根布局和鉴权守卫承载层
│   │   └── pageLayout/    # 侧栏、页头、面包屑和标签页
│   ├── mocks/             # Mock fetch、响应和演示数据
│   ├── pages/             # 登录、工作台、业务页和错误页
│   ├── router/
│   │   ├── config/        # 固定路由、白名单和路由常量
│   │   ├── dynamic/       # 菜单转路由和动态路由注册
│   │   └── guards/        # AuthGuard
│   ├── services/          # 通用请求和 401 处理
│   ├── stores/            # auth、user、permission、layout、tabs
│   ├── styles/            # 全局样式
│   ├── types/             # 共享类型
│   └── utils/             # 会话、菜单、权限、storage 等工具
└── tests/                 # 路由、会话、白名单和标签页测试
~~~

## 路由与权限

路由入口位于 src/router/index.ts。根路由 root 渲染 RootLayout，固定路由和服务端菜单生成的动态路由都挂在根路由下。

初始化和鉴权流程如下：

1. AuthGuard 判断当前路径是否为登录页、白名单页或业务页。
2. 业务页没有 token 时，跳转到 /login 并保存安全的站内回跳地址。
3. 有 token 时并行请求 /user/info、/menus 和 /permissions。
4. generateRoutes() 将菜单树转换为路由，registerDynamicRoutes() 将路由注册到根路由，并重新匹配当前地址。
5. 初始化成功后，从最深层路由的 meta.permission 读取权限码；没有权限时跳转 /403。
6. 请求返回 401 时，统一清理会话并回到 /login。

固定路由包括：

- /login：登录页
- /whiteList：无需登录的白名单示例页
- /dashboard：固定工作台
- /403：无权限页
- 未匹配路径：通配回退页，再由路由错误边界处理异常

当前 Mock 菜单包括：

| 页面 | 路径 | 布局 | 权限 |
| --- | --- | --- | --- |
| 工作台 | /dashboard | 标准布局 | 无 |
| 用户管理 | /system/user | 标准布局 | system:user:list |
| 角色管理 | /system/role | 标准布局 | system:role:list |
| 审计记录 | /system/audit | 标准布局 | system:audit:list |
| 全屏页面 | /fullscreen | fullpage | 无 |

演示权限只包含 system:user:list 和 system:role:list，因此审计记录菜单可以显示，但访问时会进入 /403，用于演示权限控制。

## 新增动态页面

动态页面的菜单 component 不包含 .tsx 后缀，并映射到 src/pages：

~~~
component: system/user/index
file:      src/pages/system/user/index.tsx
~~~

新增页面时：

1. 创建 src/pages/{path}/index.tsx。
2. 在后端菜单或 src/mocks/menu.ts 增加 path、component 和 meta。
3. 需要授权时设置 meta.permission，并让 /permissions 返回相同权限码。
4. 普通页面使用默认布局；不需要侧栏、页头和标签页的页面设置 meta.layout: 'fullpage'。
5. 为菜单嵌套、权限拒绝或页面组件缺失等行为补充测试。

只有固定路由才直接编辑 src/router/config/baseRoutes.ts。登录页、白名单页和错误页不要伪装成动态菜单。

## API 与 Mock 契约

业务页面通过 src/api 调用接口，通用请求逻辑位于 src/services/request.ts。默认接口契约如下：

| 方法 | 路径 | 认证 | 返回数据 |
| --- | --- | --- | --- |
| POST | /login | 否 | { token } |
| GET | /user/info | 是 | 用户信息 |
| GET | /menus | 是 | 菜单树 |
| GET | /permissions | 是 | 权限码数组 |

统一响应格式：

~~~json
{
  "code": 0,
  "message": "success",
  "data": {}
}
~~~

成功码为数字 0 或字符串 "0"。除登录接口外，请求层会从 useAuthStore 读取 token 并发送 Authorization: Bearer <token>。Mock 模式下有效 token 是 mock-token。

## 状态与主题

- auth：持久化 token。
- user：保存当前用户，不持久化。
- permission：保存菜单、权限和初始化状态，不持久化。
- layout：持久化侧栏折叠、主题模式、主题色、导航布局和水印偏好；内容全屏状态只在当前会话内有效。
- tabs：持久化已打开的路由标签页，主页标签不可关闭。

Ant Design 主题由 src/app.tsx 的 ConfigProvider 统一配置，深色模式使用官方 darkAlgorithm。新增 UI 优先使用 Ant Design 组件和 Token，避免在页面中复制全局主题逻辑。

## 开发约定

详细的 Agent 约束、Ant Design CLI 使用要求、导入规范和验收标准见 [AGENTS.md](AGENTS.md)。核心规则包括：

- 不使用分号和尾随逗号。
- 项目内部导入统一使用 @ 路径别名。
- 页面不直接调用 fetch、读取 token 或处理 401。
- 动态路由只通过菜单生成和统一注册入口维护。
- 修改 Ant Design 代码前查询 6.6.1 的 API，修改后运行 pnpm lint:antd。
