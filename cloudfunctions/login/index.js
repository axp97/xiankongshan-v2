// login：匿名身份初始化。
// anonymousId 由 openid 服务端单向派生（SHA-256 + 盐），不可反查（product-definition.md §8）。
// 不落库、不收集可识别信息：只把派生结果回给客户端。
const cloud = require('wx-server-sdk')
const crypto = require('crypto')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async () => {
  const { OPENID } = cloud.getWXContext()
  if (!OPENID) return { error: 'NO_CONTEXT' }
  const salt = process.env.ANON_SALT || 'xiankongshan-v2'
  const anonymousId = crypto
    .createHash('sha256')
    .update(`${OPENID}:${salt}`)
    .digest('hex')
    .slice(0, 32)
  return { anonymousId }
}
