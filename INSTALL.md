> **来源说明**：本项目基于 [Zayia/NetTool](https://github.com/Zayia/NetTool) 的中国联通组件与代理配置整理、迁移而来；由 [Timkeltis](https://github.com/Timkeltis) 独立维护。
>
> 已将 Scripting 小组件、Loon／Surge／Egern／Quantumult X 配置及 BoxJS 配置统一迁移至本仓库，后续更新请以本仓库为准。

# 中国联通组件服务

选择你正在使用的客户端安装对应资源，启用脚本和 MITM，信任该客户端的 MITM 证书，然后打开中国联通 App 首页触发抓取。

| 客户端 | 资源地址 | 导入位置 |
| --- | --- | --- |
| Surge | [ChinaUnicom.sgmodule](https://raw.githubusercontent.com/Timkeltis/ChinaUnicom-Scripting/main/surge/ChinaUnicom.sgmodule) | 模块 → 安装新模块 |
| Egern | [ChinaUnicom.yaml](https://raw.githubusercontent.com/Timkeltis/ChinaUnicom-Scripting/main/Egern/ChinaUnicom.yaml) | 模块 → 添加远程模块 |
| Loon | [ChinaUnicom.lpx](https://raw.githubusercontent.com/Timkeltis/ChinaUnicom-Scripting/main/Loon/ChinaUnicom.lpx) | 插件 → 添加插件 |
| Quantumult X | [ChinaUnicom.conf](https://raw.githubusercontent.com/Timkeltis/ChinaUnicom-Scripting/main/QuantumultX/ChinaUnicom.conf) | 重写 → 引用远程资源 |

这些是模块、插件或重写资源，不是完整代理配置文件。抓取规则只处理联通首页的目标请求头，不需要请求体。

## BoxJS

先在当前客户端中配置并启用 BoxJS，再在 BoxJS 的订阅管理中添加：

```text
https://raw.githubusercontent.com/Timkeltis/ChinaUnicom-Scripting/main/BoxJs/ComponentService.boxjs.json
```

抓取后，在「Zayia 组件服务 → 中国联通 → 联通 Cookie」查看结果。

抓取脚本 1.0.6 起保留请求中的 `login_type` 原值，包括 `06`、`19` 等，不再限制为 `01`，也不补默认值。更新客户端的模块、插件或重写资源后，重新打开联通 App 首页即可抓取；已有 Scripting 1.0.5 可继续使用。

```text
持久化根键：ZayiaComponentService
变量：@ZayiaComponentService.ChinaUnicom.Settings.Cookie
读取接口：<BoxJS 地址>/query/data/ZayiaComponentService
```

各客户端的持久化存储彼此独立，Scripting 需要访问当前负责抓取的客户端所提供的 BoxJS。换用客户端后需重新抓取，订阅地址和变量名不变。

## Scripting

下载并导入：[中國聯通.scripting（1.0.5）](https://raw.githubusercontent.com/Timkeltis/ChinaUnicom-Scripting/main/Scripting/中國聯通.scripting)。

中国联通 1.0.5 版的设置页已接入上述安装地址。读取逻辑仍为 BoxJS 优先，失败时回退本地手动 Cookie；关闭 BoxJS 时直接使用手动 Cookie。

## 格式与验证说明

- Egern 使用原生 YAML 的 `scriptings.http_request` 与 `mitm.hostnames.includes`，不再复用 Surge 地址。
- Loon 使用 `[Script]` 的 `http-request`，仅读取请求头。
- Quantumult X 使用官方远程重写格式：`hostname` 与 `script-request-header`。Scripting 的安装按钮使用 `add-resource` 和编码后的 JSON，追加资源。
- 四种资源复用同一份脚本。Surge、Egern、Loon 使用 `$persistentStore`；Quantumult X 使用 `$prefs`。结束时调用 `$done({})` 放行原请求。
- 已执行本地模拟测试、YAML 解析和远程资源检查。Egern、Loon、Quantumult X 的设备端运行需安装后验证；此前 Surge 抓取已由用户验证。

参考：[原版 Egern YAML](https://github.com/ByteValley/NetTool/blob/main/Egern/Module/Component/ChinaMobile.yaml)、[Loon 插件示例](https://github.com/Loon0x00/LoonExampleConfig/blob/master/Plugin/Plugin_Example.plugin)、[Quantumult X 远程重写示例](https://github.com/crossutility/Quantumult-X/blob/master/sample-import-rewrite.snippet)、[Quantumult X 安装链接规范](https://github.com/crossutility/Quantumult-X/blob/master/url-scheme.md)。
