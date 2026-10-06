const FEE_ENDPOINT = "https://m.client.10010.com/mobileserviceimportant/home/queryUserInfoSeven"

export function parseUnicomCookie(cookie: string): Record<string, string> {
  const values: Record<string, string> = Object.create(null)
  for (const part of cookie.split(";")) {
    const equal = part.indexOf("=")
    if (equal < 1) continue
    values[part.slice(0, equal).trim()] = part.slice(equal + 1).trim()
  }
  return values
}

export function buildUnicomFeeUrl(cookie: string): string {
  const values = parseUnicomCookie(cookie)
  const version = values.c_version || "iphone_c@10.0100"
  const mobile = [values.c_mobile, values.u_account].find((value) => /^1\d{10}$/.test(value || ""))
  const params = [`version=${encodeURIComponent(version)}`, "showType=0"]
  // 无手机号时由服务端通过 ECS 凭据识别账号，已实测支持；不使用作者的固定号码。
  if (mobile) params.push(`desmobiel=${encodeURIComponent(mobile)}`)
  return `${FEE_ENDPOINT}?${params.join("&")}`
}
