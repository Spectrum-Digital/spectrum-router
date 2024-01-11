import { Redis } from 'ioredis'
import { BytesLike, CompressedPath, DEXConfiguration, Token } from '../typings'

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
    type: 'paths' | 'graph-stable' | 'graph-volatile' | 'tokens' | 'blockHeightCheckpoint'
  }) {
    this.redis = new Redis(redisURL)
    this.prefix = `${redisPrefix}:${type}:${dexConfiguration.router_address}:${dexConfiguration.chainId}`
  }

  protected getHashKey(key: string): string {
    return `${this.prefix}:${key}`
  }
}

export class PathsCacheController extends CacheBase {
  private readonly EXPIRATION_TIME_SECONDS = 30 * 60

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
    if (value.length) {
      await this.redis.sadd(this.getHashKey(key), ...value)
      await this.redis.expire(this.getHashKey(key), this.EXPIRATION_TIME_SECONDS)
    }
  }
}

export class GraphStableCacheController extends CacheBase {
  constructor(args: BaseConstructor) {
    super({ ...args, type: 'graph-stable' })
  }

  public async get(tokenX: BytesLike, tokenY: BytesLike): Promise<BytesLike | undefined> {
    try {
      const key = `${tokenX}:${tokenY}`
      const pair = await this.redis.get(this.getHashKey(key))
      return pair ? BytesLike.parse(pair) : undefined
    } catch (err) {
      console.error(err)
      return undefined
    }
  }

  public async set(tokenX: BytesLike, tokenY: BytesLike, pair: BytesLike): Promise<void> {
    const key = `${tokenX}:${tokenY}`
    await this.redis.set(this.getHashKey(key), pair)
  }
}

export class GraphVolatileCacheController extends CacheBase {
  constructor(args: BaseConstructor) {
    super({ ...args, type: 'graph-volatile' })
  }

  public async get(tokenX: BytesLike, tokenY: BytesLike): Promise<BytesLike | undefined> {
    try {
      const key = `${tokenX}:${tokenY}`
      const pair = await this.redis.get(this.getHashKey(key))
      return pair ? BytesLike.parse(pair) : undefined
    } catch (err) {
      console.error(err)
      return undefined
    }
  }

  public async set(tokenX: BytesLike, tokenY: BytesLike, pair: BytesLike): Promise<void> {
    const key = `${tokenX}:${tokenY}`
    await this.redis.set(this.getHashKey(key), pair)
  }
}

export class TokensCacheController extends CacheBase {
  constructor(args: BaseConstructor) {
    super({ ...args, type: 'tokens' })
  }

  public async get(key: BytesLike): Promise<Token | undefined> {
    try {
      const token = await this.redis.hgetall(this.getHashKey(key))
      return token ? Token.parse(token) : undefined
    } catch (err) {
      console.error(err)
      return undefined
    }
  }

  public async set(key: BytesLike, value: Token): Promise<void> {
    await this.redis.hset(this.getHashKey(key), value)
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
