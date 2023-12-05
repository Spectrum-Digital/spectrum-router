import { InContextSdkMethod } from '@graphql-mesh/types';
import { MeshContext } from '@graphql-mesh/runtime';
export declare namespace SpectrumRouterBaseTypes {
    type Maybe<T> = T | null;
    type InputMaybe<T> = Maybe<T>;
    type Exact<T extends {
        [key: string]: unknown;
    }> = {
        [K in keyof T]: T[K];
    };
    type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
        [SubKey in K]?: Maybe<T[SubKey]>;
    };
    type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
        [SubKey in K]: Maybe<T[SubKey]>;
    };
    /** All built-in and custom scalars, mapped to their actual values */
    type Scalars = {
        ID: string;
        String: string;
        Boolean: boolean;
        Int: number;
        Float: number;
        BigDecimal: any;
        BigInt: any;
        Bytes: any;
        Int8: any;
    };
    type BlockChangedFilter = {
        number_gte: Scalars['Int'];
    };
    type Block_height = {
        hash?: InputMaybe<Scalars['Bytes']>;
        number?: InputMaybe<Scalars['Int']>;
        number_gte?: InputMaybe<Scalars['Int']>;
    };
    /** Defines the order direction, either ascending or descending */
    type OrderDirection = 'asc' | 'desc';
    type Pool = {
        id: Scalars['ID'];
        blockNumber: Scalars['BigInt'];
        factory: PoolFactory;
        decimals: Scalars['Int'];
        token0: Token;
        token1: Token;
        stable: Scalars['Boolean'];
    };
    type PoolFactory = {
        id: Scalars['ID'];
        pools: Array<Pool>;
    };
    type PoolFactorypoolsArgs = {
        skip?: InputMaybe<Scalars['Int']>;
        first?: InputMaybe<Scalars['Int']>;
        orderBy?: InputMaybe<Pool_orderBy>;
        orderDirection?: InputMaybe<OrderDirection>;
        where?: InputMaybe<Pool_filter>;
    };
    type PoolFactory_filter = {
        id?: InputMaybe<Scalars['ID']>;
        id_not?: InputMaybe<Scalars['ID']>;
        id_gt?: InputMaybe<Scalars['ID']>;
        id_lt?: InputMaybe<Scalars['ID']>;
        id_gte?: InputMaybe<Scalars['ID']>;
        id_lte?: InputMaybe<Scalars['ID']>;
        id_in?: InputMaybe<Array<Scalars['ID']>>;
        id_not_in?: InputMaybe<Array<Scalars['ID']>>;
        pools_?: InputMaybe<Pool_filter>;
        /** Filter for the block changed event. */
        _change_block?: InputMaybe<BlockChangedFilter>;
        and?: InputMaybe<Array<InputMaybe<PoolFactory_filter>>>;
        or?: InputMaybe<Array<InputMaybe<PoolFactory_filter>>>;
    };
    type PoolFactory_orderBy = 'id' | 'pools';
    type Pool_filter = {
        id?: InputMaybe<Scalars['ID']>;
        id_not?: InputMaybe<Scalars['ID']>;
        id_gt?: InputMaybe<Scalars['ID']>;
        id_lt?: InputMaybe<Scalars['ID']>;
        id_gte?: InputMaybe<Scalars['ID']>;
        id_lte?: InputMaybe<Scalars['ID']>;
        id_in?: InputMaybe<Array<Scalars['ID']>>;
        id_not_in?: InputMaybe<Array<Scalars['ID']>>;
        blockNumber?: InputMaybe<Scalars['BigInt']>;
        blockNumber_not?: InputMaybe<Scalars['BigInt']>;
        blockNumber_gt?: InputMaybe<Scalars['BigInt']>;
        blockNumber_lt?: InputMaybe<Scalars['BigInt']>;
        blockNumber_gte?: InputMaybe<Scalars['BigInt']>;
        blockNumber_lte?: InputMaybe<Scalars['BigInt']>;
        blockNumber_in?: InputMaybe<Array<Scalars['BigInt']>>;
        blockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
        factory?: InputMaybe<Scalars['String']>;
        factory_not?: InputMaybe<Scalars['String']>;
        factory_gt?: InputMaybe<Scalars['String']>;
        factory_lt?: InputMaybe<Scalars['String']>;
        factory_gte?: InputMaybe<Scalars['String']>;
        factory_lte?: InputMaybe<Scalars['String']>;
        factory_in?: InputMaybe<Array<Scalars['String']>>;
        factory_not_in?: InputMaybe<Array<Scalars['String']>>;
        factory_contains?: InputMaybe<Scalars['String']>;
        factory_contains_nocase?: InputMaybe<Scalars['String']>;
        factory_not_contains?: InputMaybe<Scalars['String']>;
        factory_not_contains_nocase?: InputMaybe<Scalars['String']>;
        factory_starts_with?: InputMaybe<Scalars['String']>;
        factory_starts_with_nocase?: InputMaybe<Scalars['String']>;
        factory_not_starts_with?: InputMaybe<Scalars['String']>;
        factory_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
        factory_ends_with?: InputMaybe<Scalars['String']>;
        factory_ends_with_nocase?: InputMaybe<Scalars['String']>;
        factory_not_ends_with?: InputMaybe<Scalars['String']>;
        factory_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
        factory_?: InputMaybe<PoolFactory_filter>;
        decimals?: InputMaybe<Scalars['Int']>;
        decimals_not?: InputMaybe<Scalars['Int']>;
        decimals_gt?: InputMaybe<Scalars['Int']>;
        decimals_lt?: InputMaybe<Scalars['Int']>;
        decimals_gte?: InputMaybe<Scalars['Int']>;
        decimals_lte?: InputMaybe<Scalars['Int']>;
        decimals_in?: InputMaybe<Array<Scalars['Int']>>;
        decimals_not_in?: InputMaybe<Array<Scalars['Int']>>;
        token0?: InputMaybe<Scalars['String']>;
        token0_not?: InputMaybe<Scalars['String']>;
        token0_gt?: InputMaybe<Scalars['String']>;
        token0_lt?: InputMaybe<Scalars['String']>;
        token0_gte?: InputMaybe<Scalars['String']>;
        token0_lte?: InputMaybe<Scalars['String']>;
        token0_in?: InputMaybe<Array<Scalars['String']>>;
        token0_not_in?: InputMaybe<Array<Scalars['String']>>;
        token0_contains?: InputMaybe<Scalars['String']>;
        token0_contains_nocase?: InputMaybe<Scalars['String']>;
        token0_not_contains?: InputMaybe<Scalars['String']>;
        token0_not_contains_nocase?: InputMaybe<Scalars['String']>;
        token0_starts_with?: InputMaybe<Scalars['String']>;
        token0_starts_with_nocase?: InputMaybe<Scalars['String']>;
        token0_not_starts_with?: InputMaybe<Scalars['String']>;
        token0_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
        token0_ends_with?: InputMaybe<Scalars['String']>;
        token0_ends_with_nocase?: InputMaybe<Scalars['String']>;
        token0_not_ends_with?: InputMaybe<Scalars['String']>;
        token0_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
        token0_?: InputMaybe<Token_filter>;
        token1?: InputMaybe<Scalars['String']>;
        token1_not?: InputMaybe<Scalars['String']>;
        token1_gt?: InputMaybe<Scalars['String']>;
        token1_lt?: InputMaybe<Scalars['String']>;
        token1_gte?: InputMaybe<Scalars['String']>;
        token1_lte?: InputMaybe<Scalars['String']>;
        token1_in?: InputMaybe<Array<Scalars['String']>>;
        token1_not_in?: InputMaybe<Array<Scalars['String']>>;
        token1_contains?: InputMaybe<Scalars['String']>;
        token1_contains_nocase?: InputMaybe<Scalars['String']>;
        token1_not_contains?: InputMaybe<Scalars['String']>;
        token1_not_contains_nocase?: InputMaybe<Scalars['String']>;
        token1_starts_with?: InputMaybe<Scalars['String']>;
        token1_starts_with_nocase?: InputMaybe<Scalars['String']>;
        token1_not_starts_with?: InputMaybe<Scalars['String']>;
        token1_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
        token1_ends_with?: InputMaybe<Scalars['String']>;
        token1_ends_with_nocase?: InputMaybe<Scalars['String']>;
        token1_not_ends_with?: InputMaybe<Scalars['String']>;
        token1_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
        token1_?: InputMaybe<Token_filter>;
        stable?: InputMaybe<Scalars['Boolean']>;
        stable_not?: InputMaybe<Scalars['Boolean']>;
        stable_in?: InputMaybe<Array<Scalars['Boolean']>>;
        stable_not_in?: InputMaybe<Array<Scalars['Boolean']>>;
        /** Filter for the block changed event. */
        _change_block?: InputMaybe<BlockChangedFilter>;
        and?: InputMaybe<Array<InputMaybe<Pool_filter>>>;
        or?: InputMaybe<Array<InputMaybe<Pool_filter>>>;
    };
    type Pool_orderBy = 'id' | 'blockNumber' | 'factory' | 'factory__id' | 'decimals' | 'token0' | 'token0__id' | 'token0__name' | 'token0__symbol' | 'token0__decimals' | 'token1' | 'token1__id' | 'token1__name' | 'token1__symbol' | 'token1__decimals' | 'stable';
    type Query = {
        poolFactory?: Maybe<PoolFactory>;
        poolFactories: Array<PoolFactory>;
        pool?: Maybe<Pool>;
        pools: Array<Pool>;
        token?: Maybe<Token>;
        tokens: Array<Token>;
        /** Access to subgraph metadata */
        _meta?: Maybe<_Meta_>;
    };
    type QuerypoolFactoryArgs = {
        id: Scalars['ID'];
        block?: InputMaybe<Block_height>;
        subgraphError?: _SubgraphErrorPolicy_;
    };
    type QuerypoolFactoriesArgs = {
        skip?: InputMaybe<Scalars['Int']>;
        first?: InputMaybe<Scalars['Int']>;
        orderBy?: InputMaybe<PoolFactory_orderBy>;
        orderDirection?: InputMaybe<OrderDirection>;
        where?: InputMaybe<PoolFactory_filter>;
        block?: InputMaybe<Block_height>;
        subgraphError?: _SubgraphErrorPolicy_;
    };
    type QuerypoolArgs = {
        id: Scalars['ID'];
        block?: InputMaybe<Block_height>;
        subgraphError?: _SubgraphErrorPolicy_;
    };
    type QuerypoolsArgs = {
        skip?: InputMaybe<Scalars['Int']>;
        first?: InputMaybe<Scalars['Int']>;
        orderBy?: InputMaybe<Pool_orderBy>;
        orderDirection?: InputMaybe<OrderDirection>;
        where?: InputMaybe<Pool_filter>;
        block?: InputMaybe<Block_height>;
        subgraphError?: _SubgraphErrorPolicy_;
    };
    type QuerytokenArgs = {
        id: Scalars['ID'];
        block?: InputMaybe<Block_height>;
        subgraphError?: _SubgraphErrorPolicy_;
    };
    type QuerytokensArgs = {
        skip?: InputMaybe<Scalars['Int']>;
        first?: InputMaybe<Scalars['Int']>;
        orderBy?: InputMaybe<Token_orderBy>;
        orderDirection?: InputMaybe<OrderDirection>;
        where?: InputMaybe<Token_filter>;
        block?: InputMaybe<Block_height>;
        subgraphError?: _SubgraphErrorPolicy_;
    };
    type Query_metaArgs = {
        block?: InputMaybe<Block_height>;
    };
    type Subscription = {
        poolFactory?: Maybe<PoolFactory>;
        poolFactories: Array<PoolFactory>;
        pool?: Maybe<Pool>;
        pools: Array<Pool>;
        token?: Maybe<Token>;
        tokens: Array<Token>;
        /** Access to subgraph metadata */
        _meta?: Maybe<_Meta_>;
    };
    type SubscriptionpoolFactoryArgs = {
        id: Scalars['ID'];
        block?: InputMaybe<Block_height>;
        subgraphError?: _SubgraphErrorPolicy_;
    };
    type SubscriptionpoolFactoriesArgs = {
        skip?: InputMaybe<Scalars['Int']>;
        first?: InputMaybe<Scalars['Int']>;
        orderBy?: InputMaybe<PoolFactory_orderBy>;
        orderDirection?: InputMaybe<OrderDirection>;
        where?: InputMaybe<PoolFactory_filter>;
        block?: InputMaybe<Block_height>;
        subgraphError?: _SubgraphErrorPolicy_;
    };
    type SubscriptionpoolArgs = {
        id: Scalars['ID'];
        block?: InputMaybe<Block_height>;
        subgraphError?: _SubgraphErrorPolicy_;
    };
    type SubscriptionpoolsArgs = {
        skip?: InputMaybe<Scalars['Int']>;
        first?: InputMaybe<Scalars['Int']>;
        orderBy?: InputMaybe<Pool_orderBy>;
        orderDirection?: InputMaybe<OrderDirection>;
        where?: InputMaybe<Pool_filter>;
        block?: InputMaybe<Block_height>;
        subgraphError?: _SubgraphErrorPolicy_;
    };
    type SubscriptiontokenArgs = {
        id: Scalars['ID'];
        block?: InputMaybe<Block_height>;
        subgraphError?: _SubgraphErrorPolicy_;
    };
    type SubscriptiontokensArgs = {
        skip?: InputMaybe<Scalars['Int']>;
        first?: InputMaybe<Scalars['Int']>;
        orderBy?: InputMaybe<Token_orderBy>;
        orderDirection?: InputMaybe<OrderDirection>;
        where?: InputMaybe<Token_filter>;
        block?: InputMaybe<Block_height>;
        subgraphError?: _SubgraphErrorPolicy_;
    };
    type Subscription_metaArgs = {
        block?: InputMaybe<Block_height>;
    };
    type Token = {
        id: Scalars['ID'];
        name: Scalars['String'];
        symbol: Scalars['String'];
        decimals: Scalars['Int'];
    };
    type Token_filter = {
        id?: InputMaybe<Scalars['ID']>;
        id_not?: InputMaybe<Scalars['ID']>;
        id_gt?: InputMaybe<Scalars['ID']>;
        id_lt?: InputMaybe<Scalars['ID']>;
        id_gte?: InputMaybe<Scalars['ID']>;
        id_lte?: InputMaybe<Scalars['ID']>;
        id_in?: InputMaybe<Array<Scalars['ID']>>;
        id_not_in?: InputMaybe<Array<Scalars['ID']>>;
        name?: InputMaybe<Scalars['String']>;
        name_not?: InputMaybe<Scalars['String']>;
        name_gt?: InputMaybe<Scalars['String']>;
        name_lt?: InputMaybe<Scalars['String']>;
        name_gte?: InputMaybe<Scalars['String']>;
        name_lte?: InputMaybe<Scalars['String']>;
        name_in?: InputMaybe<Array<Scalars['String']>>;
        name_not_in?: InputMaybe<Array<Scalars['String']>>;
        name_contains?: InputMaybe<Scalars['String']>;
        name_contains_nocase?: InputMaybe<Scalars['String']>;
        name_not_contains?: InputMaybe<Scalars['String']>;
        name_not_contains_nocase?: InputMaybe<Scalars['String']>;
        name_starts_with?: InputMaybe<Scalars['String']>;
        name_starts_with_nocase?: InputMaybe<Scalars['String']>;
        name_not_starts_with?: InputMaybe<Scalars['String']>;
        name_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
        name_ends_with?: InputMaybe<Scalars['String']>;
        name_ends_with_nocase?: InputMaybe<Scalars['String']>;
        name_not_ends_with?: InputMaybe<Scalars['String']>;
        name_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
        symbol?: InputMaybe<Scalars['String']>;
        symbol_not?: InputMaybe<Scalars['String']>;
        symbol_gt?: InputMaybe<Scalars['String']>;
        symbol_lt?: InputMaybe<Scalars['String']>;
        symbol_gte?: InputMaybe<Scalars['String']>;
        symbol_lte?: InputMaybe<Scalars['String']>;
        symbol_in?: InputMaybe<Array<Scalars['String']>>;
        symbol_not_in?: InputMaybe<Array<Scalars['String']>>;
        symbol_contains?: InputMaybe<Scalars['String']>;
        symbol_contains_nocase?: InputMaybe<Scalars['String']>;
        symbol_not_contains?: InputMaybe<Scalars['String']>;
        symbol_not_contains_nocase?: InputMaybe<Scalars['String']>;
        symbol_starts_with?: InputMaybe<Scalars['String']>;
        symbol_starts_with_nocase?: InputMaybe<Scalars['String']>;
        symbol_not_starts_with?: InputMaybe<Scalars['String']>;
        symbol_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
        symbol_ends_with?: InputMaybe<Scalars['String']>;
        symbol_ends_with_nocase?: InputMaybe<Scalars['String']>;
        symbol_not_ends_with?: InputMaybe<Scalars['String']>;
        symbol_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
        decimals?: InputMaybe<Scalars['Int']>;
        decimals_not?: InputMaybe<Scalars['Int']>;
        decimals_gt?: InputMaybe<Scalars['Int']>;
        decimals_lt?: InputMaybe<Scalars['Int']>;
        decimals_gte?: InputMaybe<Scalars['Int']>;
        decimals_lte?: InputMaybe<Scalars['Int']>;
        decimals_in?: InputMaybe<Array<Scalars['Int']>>;
        decimals_not_in?: InputMaybe<Array<Scalars['Int']>>;
        /** Filter for the block changed event. */
        _change_block?: InputMaybe<BlockChangedFilter>;
        and?: InputMaybe<Array<InputMaybe<Token_filter>>>;
        or?: InputMaybe<Array<InputMaybe<Token_filter>>>;
    };
    type Token_orderBy = 'id' | 'name' | 'symbol' | 'decimals';
    type _Block_ = {
        /** The hash of the block */
        hash?: Maybe<Scalars['Bytes']>;
        /** The block number */
        number: Scalars['Int'];
        /** Integer representation of the timestamp stored in blocks for the chain */
        timestamp?: Maybe<Scalars['Int']>;
    };
    /** The type for the top-level _meta field */
    type _Meta_ = {
        /**
         * Information about a specific subgraph block. The hash of the block
         * will be null if the _meta field has a block constraint that asks for
         * a block number. It will be filled if the _meta field has no block constraint
         * and therefore asks for the latest  block
         *
         */
        block: _Block_;
        /** The deployment ID */
        deployment: Scalars['String'];
        /** If `true`, the subgraph encountered indexing errors at some past block */
        hasIndexingErrors: Scalars['Boolean'];
    };
    type _SubgraphErrorPolicy_ = 
    /** Data will be returned even if the subgraph has indexing errors */
    'allow'
    /** If the subgraph has indexing errors, data will be omitted. The default. */
     | 'deny';
    type QuerySdk = {
        /** null **/
        poolFactory: InContextSdkMethod<Query['poolFactory'], QuerypoolFactoryArgs, MeshContext>;
        /** null **/
        poolFactories: InContextSdkMethod<Query['poolFactories'], QuerypoolFactoriesArgs, MeshContext>;
        /** null **/
        pool: InContextSdkMethod<Query['pool'], QuerypoolArgs, MeshContext>;
        /** null **/
        pools: InContextSdkMethod<Query['pools'], QuerypoolsArgs, MeshContext>;
        /** null **/
        token: InContextSdkMethod<Query['token'], QuerytokenArgs, MeshContext>;
        /** null **/
        tokens: InContextSdkMethod<Query['tokens'], QuerytokensArgs, MeshContext>;
        /** Access to subgraph metadata **/
        _meta: InContextSdkMethod<Query['_meta'], Query_metaArgs, MeshContext>;
    };
    type MutationSdk = {};
    type SubscriptionSdk = {
        /** null **/
        poolFactory: InContextSdkMethod<Subscription['poolFactory'], SubscriptionpoolFactoryArgs, MeshContext>;
        /** null **/
        poolFactories: InContextSdkMethod<Subscription['poolFactories'], SubscriptionpoolFactoriesArgs, MeshContext>;
        /** null **/
        pool: InContextSdkMethod<Subscription['pool'], SubscriptionpoolArgs, MeshContext>;
        /** null **/
        pools: InContextSdkMethod<Subscription['pools'], SubscriptionpoolsArgs, MeshContext>;
        /** null **/
        token: InContextSdkMethod<Subscription['token'], SubscriptiontokenArgs, MeshContext>;
        /** null **/
        tokens: InContextSdkMethod<Subscription['tokens'], SubscriptiontokensArgs, MeshContext>;
        /** Access to subgraph metadata **/
        _meta: InContextSdkMethod<Subscription['_meta'], Subscription_metaArgs, MeshContext>;
    };
    type Context = {
        ["SpectrumRouterBase"]: {
            Query: QuerySdk;
            Mutation: MutationSdk;
            Subscription: SubscriptionSdk;
        };
        ["url"]: Scalars['ID'];
    };
}
