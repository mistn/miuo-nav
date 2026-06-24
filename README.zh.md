# Miuo Nav

极简浏览器起始页 / 仪表盘。

- 多引擎搜索（Google、DuckDuckGo、Bing、百度、GitHub）
- 书签管理：拖拽排序、分类、编辑/删除、WebDAV 云同步
- 实时时钟 + 天气（Open-Meteo，无需 API Key）
- 亮色/暗色主题、中英文切换、自定义背景图
- 侧边栏：手风琴式分类分组
- 所有数据存储在 localStorage（支持 JSON 导入导出）

## 功能一览

| 功能 | 说明 |
|------|------|
| **搜索** | Ctrl+K 快速聚焦，5 种搜索引擎，Favicon 图标 |
| **书签** | 固定到首页、右键编辑/删除、拖拽排序 |
| **分类** | 按归类分组，侧边栏手风琴折叠 |
| **天气** | 自动拉取 Open-Meteo，可在设置中关闭 |
| **背景** | 必应每日 / 自定义图片链接 / 本地上传 |
| **WebDAV 同步** | 推送到任意 WebDAV 服务器 |
| **多语言** | 自动识别浏览器语言，设置内切换 |
| **主题** | 亮色/暗色一键切换 |

## 部署到 Vercel

1. 推送到 GitHub
2. 打开 [vercel.com](https://vercel.com) → 添加新项目
3. 导入 `miuo-nav` 仓库
4. **构建命令**: `pnpm build`
5. **输出目录**: `dist`
6. 点击 **Deploy**

或用 CLI：

```
npm i -g vercel
vercel --prod
```

项目为纯静态前端，也可部署到 Cloudflare Pages、Netlify 等平台。

## API 配置说明

### 天气

使用 [高德天气 API](https://lbs.amap.com/api/webservice/guide/api/weatherinfo)。

1. 去[高德开放平台](https://lbs.amap.com/) → 应用管理 → 创建应用 → 添加 Key（Web 服务类型）
2. 设置 → 偏好 → 开启天气 → 填入 **API Key**、**城市代码**（如上海 `310000`）、**城市名称**

城市代码表：[高德行政区划](https://lbs.amap.com/api/webservice/download)

API 请求通过 Vite（本地开发）或 Vercel（生产环境）代理转发，无需额外 CORS 配置。

### 必应每日背景

通过第三方代理 `bing.biturl.top` 获取必应每日图片，无需 API Key。如果代理不可用，可在设置中切换到"自定义链接"直接填写图片 URL。

### WebDAV

| 字段 | 说明 |
|------|------|
| 服务器地址 | `https://dav.example.com` |
| 用户名 | WebDAV 用户名 |
| 密码 | WebDAV 密码 |

凭据保存在 localStorage，书签以 `miuo_nav_config.json` 文件名同步到服务端。

## 技术栈

- **Vite** + **React 19** + **TypeScript**
- **Tailwind CSS v4**（class 式暗色模式）
- **shadcn/ui**（Radix 原语组件）
- **i18next** + **react-i18next**
- **webdav**（前端 WebDAV 客户端）

## 本地开发

```
pnpm install
pnpm dev      # http://localhost:5173
pnpm build    # 输出到 dist/
```
