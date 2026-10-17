# MORI 木里 · 跨端生活方式商店

GitHub: <https://github.com/wine1133/mori-shop>

在线预览：<https://wine1133.github.io/mori-shop/>

一个基于 **uni-app + Vue 3 + TypeScript + uniCloud 云函数** 的跨端电商项目。同一套代码可编译为：

- 微信小程序
- iOS / Android App
- H5 网页

当前已完成前端界面、核心云函数后端、本地数据库联调测试与多端构建。

## 已实现页面

| 页面 | 功能 |
| --- | --- |
| 首页 | 商品瀑布流、12 件示例商品、分类筛选、搜索、收藏、购物袋数量 |
| 商品详情 | 多图轮播、价格、颜色、尺码、库存、数量、加入购物袋、立即购买、演示订单确认 |
| 购物袋 | 商品勾选、全选、数量增减、单件移除、批量删除、合计、演示结算 |
| 个人中心 | 会员信息、积分、我的订单、订单状态、收藏、优惠券、收货地址编辑与保存 |

配置 uniCloud 服务空间后，商品、订单和库存会使用真实云数据库；未配置时 H5 会自动回退到本地 `Storage` 演示数据，首次进入仍保留 2 件购物袋商品和 1 条历史订单。

## 云函数后端

已实现 4 个核心业务云函数和 1 个示例数据初始化函数：

- `product-list`：读取在售商品列表
- `product-detail`：按商品 ID 查询详情
- `create-order`：事务校验商品、尺码、颜色、库存，服务端重算价格并创建订单
- `order-list`：按用户身份查询历史订单
- `seed-products`：幂等写入 12 件示例商品

创建订单后支付状态固定为 `unpaid / 未支付`，暂未实现支付调用。小程序与 App 使用 `uniCloud.callFunction`，H5 支持云函数 URL 化或回退到本地演示数据。

详见 [云函数后端文档](docs/CLOUD_FUNCTIONS.md)。

## 在线预览

- GitHub Pages：<https://wine1133.github.io/mori-shop/>
- 自动部署工作流：`.github/workflows/deploy-pages.yml`

## 本地预览

环境要求：Node.js 22.12+

```bash
npm install
npm run dev:h5
```

生产预览：

```bash
npm run build:h5
node scripts/preview-server.mjs
# 打开 http://127.0.0.1:4173
# 若端口被占用：$env:PORT="4187"; node scripts/preview-server.mjs
```

## 多端构建

```bash
# H5
npm run build:h5
# 产物：dist/build/h5

# 微信小程序
npm run build:mp-weixin
# 产物：dist/build/mp-weixin
# 用微信开发者工具导入该目录

# App（HBuilderX 继续打包）
npm run build:app
# 产物：dist/build/app
```

微信小程序发布前需在 `src/manifest.json` 中填写真实 `mp-weixin.appid`。

## 一键上线

### 方式一：Netlify Drop（最快）

1. 打开 <https://app.netlify.com/drop>
2. 拖入 `release/mori-h5.zip`
3. 等待上传完成即可获得公网地址

仓库中的 `netlify.toml` 也支持连接 Git 仓库后自动构建发布。纯静态 H5 默认使用本地演示数据；要使用真实云函数，请配置 `VITE_CLOUD_HTTP_BASE` 后重新构建。

### 方式二：Vercel

导入仓库即可，`vercel.json` 已声明构建命令和产物目录：

- Build Command: `npm run build:h5`
- Output Directory: `dist/build/h5`

### 方式三：Docker

```bash
docker build -t mori-shop .
docker run --rm -p 8080:80 mori-shop
```

打开 <http://127.0.0.1:8080>。

## 自动检查

```bash
npm run type-check
node scripts/e2e-check.mjs
```

E2E 会检查首页瀑布流、图片加载、搜索、分类筛选、详情页、加入购物袋、立即购买面板、购物袋、个人中心和地址编辑，并在 `validation/` 输出移动端截图。

云函数测试：

```bash
npm run test:cloud
```

该测试使用内存数据库执行真实的商品列表、详情、创建订单、订单查询和商品初始化逻辑。

## 设计说明

- 品牌方向：自然、克制、留白的东方生活方式商店
- 主色：暖象牙 `#F4F0E8`、墨色 `#1D211C`、森林绿 `#263C32`、陶土红 `#B75438`
- 标题使用衬线字体，信息层级采用编辑杂志式排版
- 商品图片与图标均已本地化，避免跨端运行时依赖第三方图床

## Figma 对接说明

本次会话未加载 Figma MCP Server，也未收到 Figma 文件或节点链接，因此当前界面依据需求文档完成设计还原。拿到 Figma 链接后，可继续做节点级布局、字号、间距与切图校准，现有页面结构和设计令牌可直接复用。

## 生产化建议

1. 接入 `uni-id` 登录体系，替换 H5/App 当前的稳定客户端 ID。
2. 增加后台管理端的商品维护、订单发货和库存调整。
3. 接入微信支付，并将支付回调与订单状态机结合。
4. 增加管理员权限、操作日志、订单超时关闭和库存回滚任务。