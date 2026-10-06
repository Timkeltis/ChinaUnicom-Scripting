/*
 * Surge / Egern / Loon / Quantumult X 请求头脚本。
 * 基于 ByteValley 中国联通组件服务的 BoxJS 数据结构。
 * 只保存小组件使用的字段，不修改请求、不输出凭据、不请求任何外部服务。
 * 持久化根键：ZayiaComponentService
 * BoxJS 字段：@ZayiaComponentService.ChinaUnicom.Settings.Cookie
 */
(function () {
  "use strict";

  const ROOT_KEY = "ZayiaComponentService";
  // App 各版本携带 ECS 凭据的接口并不固定，因此监听联通业务主机；后续仅处理完整凭据。
  const TARGET = /^https:\/\/m\.client\.10010\.com\/.+/;
  const COOLDOWN_MS = 10 * 60 * 1000;

  function readStore(key) {
    return typeof $prefs !== "undefined" ? $prefs.valueForKey(key) : $persistentStore.read(key);
  }

  function writeStore(value, key) {
    return typeof $prefs !== "undefined" ? $prefs.setValueForKey(value, key) : $persistentStore.write(value, key);
  }

  function notifyUpdated() {
    const title = "中国联通";
    const subtitle = "小组件凭据已更新";
    const message = "已保存至 BoxJS：Zayia 组件服务 → 中国联通 → 联通 Cookie。";
    if (typeof $notify === "function") {
      $notify(title, subtitle, message);
    } else {
      $notification.post(title, subtitle, message);
    }
  }

  function isObject(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
  }

  function parseCookie(raw) {
    const fields = Object.create(null);
    for (const part of raw.split(";")) {
      const equal = part.indexOf("=");
      if (equal < 1) continue;
      // 仅按第一个等号分割，保留令牌中的 +、/、=，不进行 URL 解码。
      fields[part.slice(0, equal).trim()] = part.slice(equal + 1).trim();
    }
    return fields;
  }

  try {
    if (typeof $request === "undefined") return;
    if (!TARGET.test($request.url || "")) return;

    const headers = $request.headers || {};
    const headerName = Object.keys(headers).find((name) => name.toLowerCase() === "cookie");
    const raw = headerName ? headers[headerName] : "";
    if (typeof raw !== "string" || /[\r\n]/.test(raw)) return;
    const fields = parseCookie(raw);

    // 绝大多数主机请求会在这里静默结束；只有完整 ECS 凭据才继续读写存储。
    if (!fields.ecs_token || !fields.ecs_acc) return;

    const stored = readStore(ROOT_KEY);
    const root = stored ? JSON.parse(stored) : {};
    if (!isObject(root)) throw new Error("Invalid root");
    if (root.ChinaUnicom != null && !isObject(root.ChinaUnicom)) throw new Error("Invalid carrier");
    const carrier = root.ChinaUnicom || {};
    const capture = isObject(carrier.Capture) ? carrier.Capture : {};
    const now = Date.now();
    const lastSuccessAt = Number(capture.LastSuccessAt || 0);
    // 完整凭据抓取成功后的 10 分钟内不再保存，也不再通知。
    if (lastSuccessAt > 0 && now - lastSuccessAt < COOLDOWN_MS) return;
    const parts = [
      "ecs_token=" + fields.ecs_token,
      "ecs_acc=" + fields.ecs_acc,
    ];
    // 保留抓取值，不限制为 01；空值原样保留，缺失时不补造字段。
    if (typeof fields.login_type === "string") parts.push("login_type=" + fields.login_type);
    // 手机号用于话费 URL；不是额外的认证令牌。
    const mobile = [fields.c_mobile, fields.u_account].find((value) => /^1\d{10}$/.test(value || ""));
    if (mobile) parts.push("c_mobile=" + mobile);
    if (fields.c_version && /^[a-zA-Z0-9_@.-]+$/.test(fields.c_version)) {
      parts.push("c_version=" + fields.c_version);
    }
    const cookie = parts.join("; ");

    if (carrier.Settings != null && !isObject(carrier.Settings)) throw new Error("Invalid settings");
    const settings = carrier.Settings || {};
    const changed = settings.Cookie !== cookie;

    settings.Cookie = cookie;
    carrier.Settings = settings;
    let sourcePath = "";
    try { sourcePath = new URL($request.url).pathname; } catch (_) {}
    carrier.Capture = { LastSuccessAt: now, LastSourcePath: sourcePath };
    root.ChinaUnicom = carrier;
    if (!writeStore(JSON.stringify(root), ROOT_KEY)) throw new Error("Write failed");

    if (changed) notifyUpdated();
  } catch (_) {
    // 不输出异常对象，避免运行时错误附带 Cookie 或持久化内容。
    console.log("[中国联通] 保存失败，请检查 ZayiaComponentService 数据格式及客户端持久化存储。");
  } finally {
    $done({});
  }
})();
