<div align="center">

![new-api](/web/public/logo.png)

# New API 二次开发版

基于 [QuantumNous/new-api](https://github.com/QuantumNous/new-api) 与 [One API](https://github.com/songquanpeng/one-api) 的 AI API 网关、计费与控制台系统。

[AGPLv3](./LICENSE) · [快速开始](#快速开始) · [配置说明](#配置说明) · [开源许可](#开源许可)

</div>

## 项目说明

本仓库是一个面向自部署场景的 New API 二次开发版本，用于聚合多个上游 AI 服务，并提供统一的 API 入口、用户管理、令牌管理、用量统计、计费、订阅、推广返佣和管理后台。

本项目保留并尊重上游项目的名称、作者与许可证信息：

- 上游项目：[QuantumNous/new-api](https://github.com/QuantumNous/new-api)
- 原始基础：[One API](https://github.com/songquanpeng/one-api)，MIT License
- 当前授权：GNU Affero General Public License v3.0，见 [LICENSE](./LICENSE)

本仓库不包含私有部署配置、生产数据、接口文档截图、发布压缩包或服务器密钥。开源前请自行确认 `.env`、`data/`、`logs/`、构建产物和个人文档未被提交。

## 功能概览

- 统一 AI API 网关：兼容 OpenAI 风格接口，并支持多类上游模型服务。
- 多渠道管理：渠道配置、分组、倍率、模型限制、健康检查与失败重试。
- 用户与权限：用户管理、令牌管理、额度控制、模型权限、IP 限制。
- 计费与统计：钱包额度、调用日志、模型价格、用量统计、数据看板。
- 支付与订阅：充值、套餐订阅、订阅抵扣、订单记录，支持多种支付网关配置。
- 推广返佣：邀请码、邀请关系、返佣记录、返佣额度转移。
- 登录与安全：密码登录、OAuth、OIDC、Passkey/WebAuthn、Turnstile 等能力。
- 控制台体验：移动端适配、独立页面、钱包、推广、订阅、日志和个人设置页面。
- 国际化：后端中英文，前端支持中文、英文、法文、俄文、日文、越南文等语言。

## 技术栈

- 后端：Go、Gin、GORM
- 前端：React、Vite、Semi Design UI
- 数据库：SQLite、MySQL、PostgreSQL
- 缓存：Redis 与内存缓存
- 前端包管理：Bun
- 容器化：Docker、Docker Compose

## 快速开始

### 使用 Docker Compose

默认 Compose 会从当前源码构建镜像，适合开源仓库使用。

```bash
docker compose up -d --build
```

启动后访问：

```text
http://localhost:3000
```

生产环境部署前，请务必修改：

- `docker-compose.yml` 中数据库密码
- `SESSION_SECRET`
- 对外访问域名、支付回调域名和可信重定向域名
- 管理后台中的支付、模型、渠道、文档地址等配置

### 本地开发

后端需要 Go，前端建议使用 Bun。

```bash
cd web
bun install
bun run build
cd ..
go run main.go
```

前端单独开发：

```bash
cd web
bun install
bun run dev
```

### 手动构建 Docker 镜像

```bash
docker build -t new-api:local .
docker run --name new-api -d --restart always \
  -p 3000:3000 \
  -e TZ=Asia/Shanghai \
  -v ./data:/data \
  new-api:local
```

## 配置说明

常见环境变量可参考 [.env.example](./.env.example)。常用配置包括：

- `PORT`：服务端口，默认 `3000`
- `SQL_DSN`：数据库连接字符串
- `SQLITE_PATH`：SQLite 数据库路径
- `REDIS_CONN_STRING`：Redis 连接字符串
- `SESSION_SECRET`：会话密钥，多实例部署时必须设置为强随机值
- `FRONTEND_BASE_URL`：前端基础地址
- `TRUSTED_REDIRECT_DOMAINS`：支付成功/取消跳转允许的域名列表

更多业务配置在管理后台中维护，包括系统名称、文档地址、渠道、模型倍率、支付网关、订阅套餐、签到、推广和安全策略。

## 文档

当前仓库只保留适合开源的基础说明和 OpenAPI 描述文件：

- [管理接口 OpenAPI](./docs/openapi/api.json)
- [中继接口 OpenAPI](./docs/openapi/relay.json)

面向最终用户的使用教程、截图和 Apifox 文档不随开源仓库发布，请根据自己的站点和配置重新编写。

## 开源前检查

发布前建议执行：

```bash
git status --short
```

确认没有提交以下内容：

- `.env`、真实数据库、日志、缓存和上传文件
- 生产 Docker Compose、服务器 IP、SSH 私钥和证书
- API Key、支付密钥、OAuth Secret、Webhook Secret
- 构建产物、发布压缩包、临时截图和个人文档

本仓库的 `.gitignore` 已默认忽略常见本地文件，但正式发布前仍建议人工复查。

## 安全与合规

本项目是基础设施类软件。部署者需要自行负责：

- 上游模型服务的使用条款和费用风险
- 所在地区关于生成式 AI 服务的备案、合规和内容安全要求
- 用户数据、调用日志、支付数据和访问密钥的保护
- 生产环境的 HTTPS、反向代理、防火墙、备份和监控

请勿将未经备案或不符合法律法规要求的生成式 AI 服务提供给公众使用。

## 开源许可

本项目采用 GNU Affero 通用公共许可证 v3.0 (AGPLv3) 授权。

本项目为开源项目，在 [One API](https://github.com/songquanpeng/one-api)（MIT 许可证）的基础上进行二次开发，并基于 [QuantumNous/new-api](https://github.com/QuantumNous/new-api) 继续演进。

如果您所在的组织政策不允许使用 AGPLv3 许可的软件，或您希望规避 AGPLv3 的开源义务，请发送邮件至：support@quantumnous.com

## 致谢

感谢 One API、QuantumNous/new-api 以及相关开源社区的持续贡献。
