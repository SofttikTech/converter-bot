pragma solidity ^0.5.0;

contract Router {
  function addLiquidity(
   address tokenA,
   address tokenB,
   uint amountADesired,
   uint amountBDesired,
   uint amountAMin,
   uint amountBMin,
   address to,
   uint deadline
  ) external returns(uint amountA, uint amountB, uint liquidity) {}
}