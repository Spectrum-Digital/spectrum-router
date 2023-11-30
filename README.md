# Spectrum Router

Routing across DEXes is a difficult endeavor, because each DEX has its own discriminatory router that rejects any path that extends his factory. On top of that, there's different implementations of routers as well. Now imagine you need to route through multiple DEXes, whether it's just to estimate a token price (routing to USDC), or perhaps for arbitrage purposes. You'd need to hop between them in a specific order, but also through multiple RPC calls. This is rather annoying to deal with. With Spectrum Router, these difficulties are abstracted out for you.

## Install

```typescript
yarn add @spectrum-digital/spectrum-router
```

## Usage

A complete example can be found in the example directory [here](/example/index.ts).

## Contracts

As seen in the example file, an export of our custom RouterAddresses is provided. You can find the repository of said contracts [here](https://github.com/Spectrum-Digital/spectrum-contracts/blob/main/src/SpectrumRouter.sol).
