# MORI 云函数后端

后端代码位于 `uniCloud-aliyun/cloudfunctions/`，采用 uniCloud 云函数，可同时服务微信小程序、App 和 H5。

## 云函数清单

| 云函数 | 作用 | 主要参数 |
| --- | --- | --- |
| `product-list` | 获取在售商品列表，支持分页和分类 | `page`、`pageSize`、`category` |
| `product-detail` | 按商品 ID 获取详情 | `productId` |
| `create-order` | 校验商品、尺码、颜色与库存，创建订单并扣减库存 | `items`、`address`、`clientUserId` |
| `order-list` | 按用户查询历史订单 | `clientUserId`、`status`、`page`、`pageSize` |
| `seed-products` | 幂等写入 12 件示例商品 | 可选 `seedToken` |

公共业务逻辑在 `cloudfunctions/common/mori-shared/`，包含参数清洗、价格计算、库存校验、订单映射和订单号生成。

## 数据集合

### `mori-products`

主要字段：

- `_id`：商品 ID，例如 `P01`
- `name`、`subtitle`、`category`
- `price`、`originalPrice`
- `images`、`colors`、`sizes`
- `status`：`on_sale` / `off_sale`

`sizes` 格式：

```json
[
  { "name": "S", "stock": 3 },
  { "name": "M", "stock": 8 }
]
```

### `mori-orders`

主要字段：

- `order_no`：展示订单号
- `user_id`：微信 OPENID，或 H5/App 的稳定客户端 ID
- `items`：下单时的商品快照
- `total`：服务端重新计算后的金额
- `address`：收货地址快照
- `status`：`pending_payment`
- `payment_status`：固定为 `unpaid`
- `created_at`、`created_at_text`

## 安全与一致性

1. 创建订单不信任前端价格，统一从商品表读取当前价格。
2. 创建订单使用数据库事务，先校验库存，再扣减库存和写入订单。
3. 微信小程序优先使用云函数上下文中的 `OPENID` 作为用户标识。
4. H5/App 使用本地生成的稳定 `clientUserId`，满足当前演示需求。
5. 订单集合禁止客户端直接读写，所有操作必须经过云函数。

> 正式商用建议接入 `uni-id` 登录体系，并对 H5/App 的订单查询增加登录态和令牌校验。当前的 `clientUserId` 仅适合课程演示与前端联调。

## 部署步骤

1. 用 HBuilderX 打开项目并关联一个 uniCloud 阿里云服务空间。
2. 上传 `uniCloud-aliyun/database/` 下的两个 Schema，创建集合并设置权限。
3. 右键 `uniCloud-aliyun/cloudfunctions/`，上传全部云函数。
4. 单独运行一次 `seed-products`，写入 12 件示例商品。
   - 如果配置了环境变量 `SEED_TOKEN`，调用时需传入相同的 `seedToken`。
5. 微信开发者工具导入 `dist/build/mp-weixin` 进行小程序联调。

## H5 / App 调用方式

- 小程序与 App：直接使用 `uniCloud.callFunction`。
- H5：推荐在 uniCloud 控制台对云函数做 URL 化，然后设置：

```bash
VITE_CLOUD_HTTP_BASE=https://你的服务空间域名/你的URL化前缀
```

前端会请求：

```text
${VITE_CLOUD_HTTP_BASE}/product-list
${VITE_CLOUD_HTTP_BASE}/product-detail
${VITE_CLOUD_HTTP_BASE}/create-order
${VITE_CLOUD_HTTP_BASE}/order-list
```

- 如果 H5 是在 HBuilderX 中运行且已经关联服务空间，可设置：

```bash
VITE_CLOUD_H5_CALL=true
```

未配置云服务时，H5 自动回退到本地演示数据，便于直接验收界面。

## 接口返回格式

成功：

```json
{
  "code": 0,
  "message": "ok",
  "data": {}
}
```

失败：

```json
{
  "code": "OUT_OF_STOCK",
  "message": "商品库存不足",
  "data": null
}
```

常见错误码：`MISSING_USER`、`INVALID_ITEMS`、`INVALID_ADDRESS`、`PRODUCT_NOT_FOUND`、`PRODUCT_OFF_SALE`、`INVALID_COLOR`、`INVALID_SIZE`、`OUT_OF_STOCK`、`CREATE_ORDER_FAILED`。

## 本地自动测试

```bash
npm run test:cloud
```

该脚本使用内存数据库执行真实的商品列表、商品详情、创建订单、订单查询和商品初始化云函数，并检查：

- 服务端价格计算
- 支付状态固定为 `unpaid`
- 库存扣减
- 用户隔离查询
- 示例商品初始化