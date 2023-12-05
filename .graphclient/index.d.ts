import { GraphQLResolveInfo, SelectionSetNode, FieldNode, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
import type { GetMeshOptions } from '@graphql-mesh/runtime';
import type { YamlConfig } from '@graphql-mesh/types';
import { MeshHTTPHandler } from '@graphql-mesh/http';
import { ExecuteMeshFn, SubscribeMeshFn, MeshContext as BaseMeshContext, MeshInstance } from '@graphql-mesh/runtime';
import type { SpectrumRouterBaseTypes } from './sources/SpectrumRouterBase/types';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends {
    [key: string]: unknown;
}> = {
    [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
    [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
    [SubKey in K]: Maybe<T[SubKey]>;
};
export type RequireFields<T, K extends keyof T> = Omit<T, K> & {
    [P in K]-?: NonNullable<T[P]>;
};
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
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
export type Query = {
    poolFactory?: Maybe<PoolFactory>;
    poolFactories: Array<PoolFactory>;
    pool?: Maybe<Pool>;
    pools: Array<Pool>;
    token?: Maybe<Token>;
    tokens: Array<Token>;
    /** Access to subgraph metadata */
    _meta?: Maybe<_Meta_>;
};
export type QuerypoolFactoryArgs = {
    id: Scalars['ID'];
    block?: InputMaybe<Block_height>;
    subgraphError?: _SubgraphErrorPolicy_;
};
export type QuerypoolFactoriesArgs = {
    skip?: InputMaybe<Scalars['Int']>;
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<PoolFactory_orderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    where?: InputMaybe<PoolFactory_filter>;
    block?: InputMaybe<Block_height>;
    subgraphError?: _SubgraphErrorPolicy_;
};
export type QuerypoolArgs = {
    id: Scalars['ID'];
    block?: InputMaybe<Block_height>;
    subgraphError?: _SubgraphErrorPolicy_;
};
export type QuerypoolsArgs = {
    skip?: InputMaybe<Scalars['Int']>;
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<Pool_orderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    where?: InputMaybe<Pool_filter>;
    block?: InputMaybe<Block_height>;
    subgraphError?: _SubgraphErrorPolicy_;
};
export type QuerytokenArgs = {
    id: Scalars['ID'];
    block?: InputMaybe<Block_height>;
    subgraphError?: _SubgraphErrorPolicy_;
};
export type QuerytokensArgs = {
    skip?: InputMaybe<Scalars['Int']>;
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<Token_orderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    where?: InputMaybe<Token_filter>;
    block?: InputMaybe<Block_height>;
    subgraphError?: _SubgraphErrorPolicy_;
};
export type Query_metaArgs = {
    block?: InputMaybe<Block_height>;
};
export type Subscription = {
    poolFactory?: Maybe<PoolFactory>;
    poolFactories: Array<PoolFactory>;
    pool?: Maybe<Pool>;
    pools: Array<Pool>;
    token?: Maybe<Token>;
    tokens: Array<Token>;
    /** Access to subgraph metadata */
    _meta?: Maybe<_Meta_>;
};
export type SubscriptionpoolFactoryArgs = {
    id: Scalars['ID'];
    block?: InputMaybe<Block_height>;
    subgraphError?: _SubgraphErrorPolicy_;
};
export type SubscriptionpoolFactoriesArgs = {
    skip?: InputMaybe<Scalars['Int']>;
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<PoolFactory_orderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    where?: InputMaybe<PoolFactory_filter>;
    block?: InputMaybe<Block_height>;
    subgraphError?: _SubgraphErrorPolicy_;
};
export type SubscriptionpoolArgs = {
    id: Scalars['ID'];
    block?: InputMaybe<Block_height>;
    subgraphError?: _SubgraphErrorPolicy_;
};
export type SubscriptionpoolsArgs = {
    skip?: InputMaybe<Scalars['Int']>;
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<Pool_orderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    where?: InputMaybe<Pool_filter>;
    block?: InputMaybe<Block_height>;
    subgraphError?: _SubgraphErrorPolicy_;
};
export type SubscriptiontokenArgs = {
    id: Scalars['ID'];
    block?: InputMaybe<Block_height>;
    subgraphError?: _SubgraphErrorPolicy_;
};
export type SubscriptiontokensArgs = {
    skip?: InputMaybe<Scalars['Int']>;
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<Token_orderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    where?: InputMaybe<Token_filter>;
    block?: InputMaybe<Block_height>;
    subgraphError?: _SubgraphErrorPolicy_;
};
export type Subscription_metaArgs = {
    block?: InputMaybe<Block_height>;
};
export type BlockChangedFilter = {
    number_gte: Scalars['Int'];
};
export type Block_height = {
    hash?: InputMaybe<Scalars['Bytes']>;
    number?: InputMaybe<Scalars['Int']>;
    number_gte?: InputMaybe<Scalars['Int']>;
};
/** Defines the order direction, either ascending or descending */
export type OrderDirection = 'asc' | 'desc';
export type Pool = {
    id: Scalars['ID'];
    blockNumber: Scalars['BigInt'];
    factory: PoolFactory;
    decimals: Scalars['Int'];
    token0: Token;
    token1: Token;
    stable: Scalars['Boolean'];
    chainId: Scalars['String'];
};
export type PoolFactory = {
    id: Scalars['ID'];
    pools: Array<Pool>;
};
export type PoolFactorypoolsArgs = {
    skip?: InputMaybe<Scalars['Int']>;
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<Pool_orderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    where?: InputMaybe<Pool_filter>;
};
export type PoolFactory_filter = {
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
export type PoolFactory_orderBy = 'id' | 'pools';
export type Pool_filter = {
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
export type Pool_orderBy = 'id' | 'blockNumber' | 'factory' | 'factory__id' | 'decimals' | 'token0' | 'token0__id' | 'token0__name' | 'token0__symbol' | 'token0__decimals' | 'token1' | 'token1__id' | 'token1__name' | 'token1__symbol' | 'token1__decimals' | 'stable';
export type Token = {
    id: Scalars['ID'];
    name: Scalars['String'];
    symbol: Scalars['String'];
    decimals: Scalars['Int'];
};
export type Token_filter = {
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
export type Token_orderBy = 'id' | 'name' | 'symbol' | 'decimals';
export type _Block_ = {
    /** The hash of the block */
    hash?: Maybe<Scalars['Bytes']>;
    /** The block number */
    number: Scalars['Int'];
    /** Integer representation of the timestamp stored in blocks for the chain */
    timestamp?: Maybe<Scalars['Int']>;
};
/** The type for the top-level _meta field */
export type _Meta_ = {
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
export type _SubgraphErrorPolicy_ = 
/** Data will be returned even if the subgraph has indexing errors */
'allow'
/** If the subgraph has indexing errors, data will be omitted. The default. */
 | 'deny';
export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;
export type ResolverTypeWrapper<T> = Promise<T> | T;
export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
    resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type LegacyStitchingResolver<TResult, TParent, TContext, TArgs> = {
    fragment: string;
    resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type NewStitchingResolver<TResult, TParent, TContext, TArgs> = {
    selectionSet: string | ((fieldNode: FieldNode) => SelectionSetNode);
    resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type StitchingResolver<TResult, TParent, TContext, TArgs> = LegacyStitchingResolver<TResult, TParent, TContext, TArgs> | NewStitchingResolver<TResult, TParent, TContext, TArgs>;
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs> | StitchingResolver<TResult, TParent, TContext, TArgs>;
export type ResolverFn<TResult, TParent, TContext, TArgs> = (parent: TParent, args: TArgs, context: TContext, info: GraphQLResolveInfo) => Promise<TResult> | TResult;
export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (parent: TParent, args: TArgs, context: TContext, info: GraphQLResolveInfo) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;
export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (parent: TParent, args: TArgs, context: TContext, info: GraphQLResolveInfo) => TResult | Promise<TResult>;
export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
    subscribe: SubscriptionSubscribeFn<{
        [key in TKey]: TResult;
    }, TParent, TContext, TArgs>;
    resolve?: SubscriptionResolveFn<TResult, {
        [key in TKey]: TResult;
    }, TContext, TArgs>;
}
export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
    subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
    resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}
export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> = SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs> | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;
export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> = ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>) | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;
export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (parent: TParent, context: TContext, info: GraphQLResolveInfo) => Maybe<TTypes> | Promise<Maybe<TTypes>>;
export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;
export type NextResolverFn<T> = () => Promise<T>;
export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (next: NextResolverFn<TResult>, parent: TParent, args: TArgs, context: TContext, info: GraphQLResolveInfo) => TResult | Promise<TResult>;
/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
    Query: ResolverTypeWrapper<{}>;
    Subscription: ResolverTypeWrapper<{}>;
    BigDecimal: ResolverTypeWrapper<Scalars['BigDecimal']>;
    BigInt: ResolverTypeWrapper<Scalars['BigInt']>;
    BlockChangedFilter: BlockChangedFilter;
    Block_height: Block_height;
    Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
    Bytes: ResolverTypeWrapper<Scalars['Bytes']>;
    Float: ResolverTypeWrapper<Scalars['Float']>;
    ID: ResolverTypeWrapper<Scalars['ID']>;
    Int: ResolverTypeWrapper<Scalars['Int']>;
    Int8: ResolverTypeWrapper<Scalars['Int8']>;
    OrderDirection: OrderDirection;
    Pool: ResolverTypeWrapper<Pool>;
    PoolFactory: ResolverTypeWrapper<PoolFactory>;
    PoolFactory_filter: PoolFactory_filter;
    PoolFactory_orderBy: PoolFactory_orderBy;
    Pool_filter: Pool_filter;
    Pool_orderBy: Pool_orderBy;
    String: ResolverTypeWrapper<Scalars['String']>;
    Token: ResolverTypeWrapper<Token>;
    Token_filter: Token_filter;
    Token_orderBy: Token_orderBy;
    _Block_: ResolverTypeWrapper<_Block_>;
    _Meta_: ResolverTypeWrapper<_Meta_>;
    _SubgraphErrorPolicy_: _SubgraphErrorPolicy_;
}>;
/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
    Query: {};
    Subscription: {};
    BigDecimal: Scalars['BigDecimal'];
    BigInt: Scalars['BigInt'];
    BlockChangedFilter: BlockChangedFilter;
    Block_height: Block_height;
    Boolean: Scalars['Boolean'];
    Bytes: Scalars['Bytes'];
    Float: Scalars['Float'];
    ID: Scalars['ID'];
    Int: Scalars['Int'];
    Int8: Scalars['Int8'];
    Pool: Pool;
    PoolFactory: PoolFactory;
    PoolFactory_filter: PoolFactory_filter;
    Pool_filter: Pool_filter;
    String: Scalars['String'];
    Token: Token;
    Token_filter: Token_filter;
    _Block_: _Block_;
    _Meta_: _Meta_;
}>;
export type entityDirectiveArgs = {};
export type entityDirectiveResolver<Result, Parent, ContextType = MeshContext, Args = entityDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;
export type subgraphIdDirectiveArgs = {
    id: Scalars['String'];
};
export type subgraphIdDirectiveResolver<Result, Parent, ContextType = MeshContext, Args = subgraphIdDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;
export type derivedFromDirectiveArgs = {
    field: Scalars['String'];
};
export type derivedFromDirectiveResolver<Result, Parent, ContextType = MeshContext, Args = derivedFromDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;
export type QueryResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
    poolFactory?: Resolver<Maybe<ResolversTypes['PoolFactory']>, ParentType, ContextType, RequireFields<QuerypoolFactoryArgs, 'id' | 'subgraphError'>>;
    poolFactories?: Resolver<Array<ResolversTypes['PoolFactory']>, ParentType, ContextType, RequireFields<QuerypoolFactoriesArgs, 'skip' | 'first' | 'subgraphError'>>;
    pool?: Resolver<Maybe<ResolversTypes['Pool']>, ParentType, ContextType, RequireFields<QuerypoolArgs, 'id' | 'subgraphError'>>;
    pools?: Resolver<Array<ResolversTypes['Pool']>, ParentType, ContextType, RequireFields<QuerypoolsArgs, 'skip' | 'first' | 'subgraphError'>>;
    token?: Resolver<Maybe<ResolversTypes['Token']>, ParentType, ContextType, RequireFields<QuerytokenArgs, 'id' | 'subgraphError'>>;
    tokens?: Resolver<Array<ResolversTypes['Token']>, ParentType, ContextType, RequireFields<QuerytokensArgs, 'skip' | 'first' | 'subgraphError'>>;
    _meta?: Resolver<Maybe<ResolversTypes['_Meta_']>, ParentType, ContextType, Partial<Query_metaArgs>>;
}>;
export type SubscriptionResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['Subscription'] = ResolversParentTypes['Subscription']> = ResolversObject<{
    poolFactory?: SubscriptionResolver<Maybe<ResolversTypes['PoolFactory']>, "poolFactory", ParentType, ContextType, RequireFields<SubscriptionpoolFactoryArgs, 'id' | 'subgraphError'>>;
    poolFactories?: SubscriptionResolver<Array<ResolversTypes['PoolFactory']>, "poolFactories", ParentType, ContextType, RequireFields<SubscriptionpoolFactoriesArgs, 'skip' | 'first' | 'subgraphError'>>;
    pool?: SubscriptionResolver<Maybe<ResolversTypes['Pool']>, "pool", ParentType, ContextType, RequireFields<SubscriptionpoolArgs, 'id' | 'subgraphError'>>;
    pools?: SubscriptionResolver<Array<ResolversTypes['Pool']>, "pools", ParentType, ContextType, RequireFields<SubscriptionpoolsArgs, 'skip' | 'first' | 'subgraphError'>>;
    token?: SubscriptionResolver<Maybe<ResolversTypes['Token']>, "token", ParentType, ContextType, RequireFields<SubscriptiontokenArgs, 'id' | 'subgraphError'>>;
    tokens?: SubscriptionResolver<Array<ResolversTypes['Token']>, "tokens", ParentType, ContextType, RequireFields<SubscriptiontokensArgs, 'skip' | 'first' | 'subgraphError'>>;
    _meta?: SubscriptionResolver<Maybe<ResolversTypes['_Meta_']>, "_meta", ParentType, ContextType, Partial<Subscription_metaArgs>>;
}>;
export interface BigDecimalScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['BigDecimal'], any> {
    name: 'BigDecimal';
}
export interface BigIntScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['BigInt'], any> {
    name: 'BigInt';
}
export interface BytesScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Bytes'], any> {
    name: 'Bytes';
}
export interface Int8ScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Int8'], any> {
    name: 'Int8';
}
export type PoolResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['Pool'] = ResolversParentTypes['Pool']> = ResolversObject<{
    id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
    blockNumber?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
    factory?: Resolver<ResolversTypes['PoolFactory'], ParentType, ContextType>;
    decimals?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
    token0?: Resolver<ResolversTypes['Token'], ParentType, ContextType>;
    token1?: Resolver<ResolversTypes['Token'], ParentType, ContextType>;
    stable?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
    chainId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;
export type PoolFactoryResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['PoolFactory'] = ResolversParentTypes['PoolFactory']> = ResolversObject<{
    id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
    pools?: Resolver<Array<ResolversTypes['Pool']>, ParentType, ContextType, RequireFields<PoolFactorypoolsArgs, 'skip' | 'first'>>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;
export type TokenResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['Token'] = ResolversParentTypes['Token']> = ResolversObject<{
    id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
    name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    symbol?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    decimals?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;
export type _Block_Resolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['_Block_'] = ResolversParentTypes['_Block_']> = ResolversObject<{
    hash?: Resolver<Maybe<ResolversTypes['Bytes']>, ParentType, ContextType>;
    number?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
    timestamp?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;
export type _Meta_Resolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['_Meta_'] = ResolversParentTypes['_Meta_']> = ResolversObject<{
    block?: Resolver<ResolversTypes['_Block_'], ParentType, ContextType>;
    deployment?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    hasIndexingErrors?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;
export type Resolvers<ContextType = MeshContext> = ResolversObject<{
    Query?: QueryResolvers<ContextType>;
    Subscription?: SubscriptionResolvers<ContextType>;
    BigDecimal?: GraphQLScalarType;
    BigInt?: GraphQLScalarType;
    Bytes?: GraphQLScalarType;
    Int8?: GraphQLScalarType;
    Pool?: PoolResolvers<ContextType>;
    PoolFactory?: PoolFactoryResolvers<ContextType>;
    Token?: TokenResolvers<ContextType>;
    _Block_?: _Block_Resolvers<ContextType>;
    _Meta_?: _Meta_Resolvers<ContextType>;
}>;
export type DirectiveResolvers<ContextType = MeshContext> = ResolversObject<{
    entity?: entityDirectiveResolver<any, any, ContextType>;
    subgraphId?: subgraphIdDirectiveResolver<any, any, ContextType>;
    derivedFrom?: derivedFromDirectiveResolver<any, any, ContextType>;
}>;
export type MeshContext = SpectrumRouterBaseTypes.Context & BaseMeshContext;
export declare const rawServeConfig: YamlConfig.Config['serve'];
export declare function getMeshOptions(): Promise<GetMeshOptions>;
export declare function createBuiltMeshHTTPHandler<TServerContext = {}>(): MeshHTTPHandler<TServerContext>;
export declare function getBuiltGraphClient(): Promise<MeshInstance>;
export declare const execute: ExecuteMeshFn;
export declare const subscribe: SubscribeMeshFn;
export declare function getBuiltGraphSDK<TGlobalContext = any, TOperationContext = any>(globalContext?: TGlobalContext): {
    Pools(variables: Exact<{
        factory: string;
        blockNumber: any;
        first: number;
        skip: number;
    }>, options?: TOperationContext | undefined): Promise<PoolsQuery>;
};
export type PoolsQueryVariables = Exact<{
    factory: Scalars['String'];
    blockNumber: Scalars['BigInt'];
    first: Scalars['Int'];
    skip: Scalars['Int'];
}>;
export type PoolsQuery = {
    pools: Array<(Pick<Pool, 'blockNumber' | 'id' | 'stable'> & {
        token0: Pick<Token, 'id' | 'decimals'>;
        token1: Pick<Token, 'id' | 'decimals'>;
    })>;
};
export declare const PoolsDocument: DocumentNode<PoolsQuery, Exact<{
    factory: Scalars['String'];
    blockNumber: Scalars['BigInt'];
    first: Scalars['Int'];
    skip: Scalars['Int'];
}>>;
export type Requester<C = {}, E = unknown> = <R, V>(doc: DocumentNode, vars?: V, options?: C) => Promise<R> | AsyncIterable<R>;
export declare function getSdk<C, E>(requester: Requester<C, E>): {
    Pools(variables: PoolsQueryVariables, options?: C): Promise<PoolsQuery>;
};
export type Sdk = ReturnType<typeof getSdk>;
