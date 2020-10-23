export const redisConfReturn = (config, env, app, getRedisPrefix) => {
  return {
    host: config.REDISHOST,
    port: config.REDISPORT,
    prefix: getRedisPrefix(env, app),
    enable_offline_queue: true,
    tls: {}
  }
}
