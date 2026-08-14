# Vue Admin Template

基于 Vue 3 + TypeScript + Element Plus 的后台管理系统模板。

## 功能

- 登录/退出（Bearer Token；401 自动登出）
- 动态侧栏菜单（接口驱动，含图标）
- 路由级菜单鉴权 + 按钮级 `hasPerm`
- 首页仪表盘
- 系统管理：用户 / 菜单 / 角色
- Mock 数据（开发环境）
- 侧栏折叠
- GitHub Actions CI + 部署

## 范围边界（刻意不做）

- 无 tags-view、无 i18n、无多主题
- 侧栏默认仅两级（目录 + 菜单）
- 桌面优先，无移动端抽屉
- 不做基于菜单的 `addRoute` 动态路由

## 技术栈

Vue 3 + TypeScript + Vite 6 + Element Plus（按需组件）+ `@element-plus/icons-vue`（全局注册供 IconSelect）+ Pinia + Vue Router 4 + Axios + Sass + NProgress

## 开发

```bash
npm install
npm run dev
```

## 构建 / 类型检查

```bash
npm run typecheck
npm run build
npm run build:test
```

## 演示账号

| 用户 | 密码 | 说明 |
|------|------|------|
| `admin` | `admin123` | 全部菜单与按钮 |
| `editor` | `editor123` | 有系统页，仅用户 CRUD 按钮 |

开发环境登录页会预填 admin；生产构建不预填。

## 环境变量

见 [.env.example](.env.example)。

| 变量 | 说明 | 开发 | 测试/生产 |
|------|------|------|-----------|
| `VITE_USE_MOCK` | Mock 短路 | true | false |
| `VITE_APP_TITLE` | 系统标题 | 通用后台管理系统 | 同左或自定义 |

## 部署

- Nginx：`deploy/nginx.conf`（`/api` 反代到后端；注意是否剥离 `/api` 前缀需与后端约定）
- Secrets：`SERVER_HOST` / `SERVER_USER` / `SSH_KEY` / `SERVER_PORT` / `SERVER_DEPLOY_PATH` / `SERVER_DEPLOY_PATH_PROD`
- PR：`.github/workflows/ci.yml` 跑 `typecheck` + `build`
- 推送 `test` / `main`：分别部署测试/生产
