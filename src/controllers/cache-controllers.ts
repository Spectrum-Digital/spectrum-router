import { Redis } from 'ioredis'
import { BytesLike, CompressedPath, DEXConfiguration, NodeVolatility, Token } from '../typings'

type BaseConstructor = {
  dexConfiguration: DEXConfiguration
  redisURL: string
  redisPrefix: string
}

class CacheBase {
  protected readonly redis: Redis
  private readonly prefix: string

  constructor({
    type,
    dexConfiguration,
    redisURL,
    redisPrefix,
  }: BaseConstructor & {
    type: 'paths' | 'graph' | 'tokens' | 'volatility' | 'blockHeightCheckpoint'
  }) {
    this.redis = new Redis(redisURL)
    this.prefix = `${redisPrefix}:${type}:${dexConfiguration.router_address}:${dexConfiguration.chainId}`
  }

  protected getHashKey(key: string): string {
    return `${this.prefix}:${key}`
  }
}

export class PathsCacheController extends CacheBase {
  constructor(args: BaseConstructor) {
    super({ ...args, type: 'paths' })
  }

  public async get(key: `${BytesLike}:${BytesLike}`): Promise<CompressedPath[]> {
    try {
      const paths = await this.redis.smembers(this.getHashKey(key))
      return paths as CompressedPath[]
    } catch (err) {
      console.error(err)
      return []
    }
  }

  public async set(key: `${BytesLike}:${BytesLike}`, value: CompressedPath[]): Promise<void> {
    await this.redis.sadd(this.getHashKey(key), ...value)
    await this.redis.expire(this.getHashKey(key), 30 * 60)
  }
}

export class GraphCacheController extends CacheBase {
  constructor(args: BaseConstructor) {
    super({ ...args, type: 'graph' })
  }

  public async get(key: BytesLike): Promise<BytesLike[]> {
    try {
      const neighbors = await this.redis.smembers(this.getHashKey(key))
      return neighbors as BytesLike[]
    } catch (err) {
      console.error(err)
      return []
    }
  }

  public async set(key: BytesLike, value: BytesLike[]): Promise<void> {
    await this.redis.sadd(this.getHashKey(key), ...value)
  }
}

export class TokensCacheController extends CacheBase {
  constructor(args: BaseConstructor) {
    super({ ...args, type: 'tokens' })
  }

  public async get(key: BytesLike): Promise<Token | undefined> {
    try {
      const token = await this.redis.hgetall(this.getHashKey(key))
      return Token.parse(token)
    } catch (err) {
      console.error(err)
      return undefined
    }
  }

  public async set(key: BytesLike, value: Token): Promise<void> {
    await this.redis.hset(this.getHashKey(key), value)
  }
}

export class VolatilityCacheController extends CacheBase {
  constructor(args: BaseConstructor) {
    super({ ...args, type: 'volatility' })
  }

  public async get(key: `${BytesLike}:${BytesLike}`): Promise<NodeVolatility | undefined> {
    try {
      const volatility = await this.redis.get(this.getHashKey(key))
      return volatility ? (volatility as NodeVolatility) : undefined
    } catch (err) {
      console.error(err)
      return undefined
    }
  }

  public async set(key: `${BytesLike}:${BytesLike}`, value: NodeVolatility): Promise<void> {
    await this.redis.set(this.getHashKey(key), value)
  }
}

export class BlockheightCheckpointCacheController extends CacheBase {
  constructor(args: BaseConstructor) {
    super({ ...args, type: 'blockHeightCheckpoint' })
  }

  public async get(): Promise<number> {
    const state = await this.redis.get(this.getHashKey(''))
    return state ? parseInt(state) : 0
  }

  public async set(value: number): Promise<void> {
    await this.redis.set(this.getHashKey(''), value)
  }
}
