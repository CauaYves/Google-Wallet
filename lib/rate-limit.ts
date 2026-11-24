/**
 * Limite simples por chave (ex.: IP), em memória, para o modo demonstração.
 * É um freio de boa-fé: em hospedagem serverless cada instância tem o próprio contador.
 * Para uso público de verdade, troque por um armazenamento compartilhado.
 */
type Bucket = { count: number; resetAt: number }

export function createRateLimiter(limit: number, windowMs: number, now: () => number = Date.now) {
  const buckets = new Map<string, Bucket>()

  return function allow(key: string): boolean {
    const time = now()
    if (buckets.size > 5000) {
      for (const [k, bucket] of buckets) if (bucket.resetAt <= time) buckets.delete(k)
    }
    const bucket = buckets.get(key)
    if (!bucket || bucket.resetAt <= time) {
      buckets.set(key, { count: 1, resetAt: time + windowMs })
      return true
    }
    if (bucket.count >= limit) return false
    bucket.count += 1
    return true
  }
}
