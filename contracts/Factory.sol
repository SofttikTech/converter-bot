pragma solidity ^0.5.0;

contract Factory {
  function createPair(address tokenA, address tokenB) external returns (address pair) {}
    event PairCreated(address indexed token0, address indexed token1, address pair, uint);

}