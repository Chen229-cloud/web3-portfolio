// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract SimpleDEX {
    IERC20 public immutable tokenA;
    IERC20 public immutable tokenB;
    uint256 public reserveA;
    uint256 public reserveB;
    uint256 public constant FEE_BPS = 30;
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public totalLiquidity;

    mapping(address => uint256) public liquidity;

    event LiquidityAdded(address indexed provider, uint256 amountA, uint256 amountB, uint256 liquidityTokens);
    event LiquidityRemoved(address indexed provider, uint256 amountA, uint256 amountB, uint256 liquidityTokens);
    event Swapped(address indexed trader, address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOut);

    constructor(address _tokenA, address _tokenB) {
        require(_tokenA != _tokenB, "Same token");
        tokenA = IERC20(_tokenA);
        tokenB = IERC20(_tokenB);
    }

    function addLiquidity(uint256 amountA, uint256 amountB) external {
        require(amountA > 0 && amountB > 0, "Zero amounts");
        tokenA.transferFrom(msg.sender, address(this), amountA);
        tokenB.transferFrom(msg.sender, address(this), amountB);

        uint256 mint;
        if (totalLiquidity == 0) {
            mint = sqrt(amountA * amountB);
        } else {
            uint256 shareA = (amountA * totalLiquidity) / reserveA;
            uint256 shareB = (amountB * totalLiquidity) / reserveB;
            mint = shareA < shareB ? shareA : shareB;
        }
        require(mint > 0, "Insufficient liquidity minted");

        reserveA += amountA;
        reserveB += amountB;
        totalLiquidity += mint;
        liquidity[msg.sender] += mint;
        emit LiquidityAdded(msg.sender, amountA, amountB, mint);
    }

    function removeLiquidity(uint256 lpTokens) external {
        require(lpTokens > 0, "Zero tokens");
        require(liquidity[msg.sender] >= lpTokens, "Insufficient balance");

        uint256 amountA = (lpTokens * reserveA) / totalLiquidity;
        uint256 amountB = (lpTokens * reserveB) / totalLiquidity;

        reserveA -= amountA;
        reserveB -= amountB;
        totalLiquidity -= lpTokens;
        liquidity[msg.sender] -= lpTokens;

        tokenA.transfer(msg.sender, amountA);
        tokenB.transfer(msg.sender, amountB);
        emit LiquidityRemoved(msg.sender, amountA, amountB, lpTokens);
    }

    function swapAforB(uint256 amountIn) external {
        _swap(tokenA, tokenB, reserveA, reserveB, amountIn);
    }

    function swapBforA(uint256 amountIn) external {
        _swap(tokenB, tokenA, reserveB, reserveA, amountIn);
    }

    function getSwapAmount(uint256 reserveIn, uint256 reserveOut, uint256 amountIn) public pure returns (uint256) {
        uint256 amountInWithFee = amountIn * (BASIS_POINTS - FEE_BPS);
        return (amountInWithFee * reserveOut) / (reserveIn * BASIS_POINTS + amountInWithFee);
    }

    function getReserves() external view returns (uint256, uint256) {
        return (reserveA, reserveB);
    }

    function _swap(IERC20 tokenIn, IERC20 tokenOut, uint256 reserveIn, uint256 reserveOut, uint256 amountIn) private {
        require(amountIn > 0, "Zero amount");
        require(reserveIn > 0 && reserveOut > 0, "No liquidity");

        uint256 amountOut = getSwapAmount(reserveIn, reserveOut, amountIn);
        require(amountOut > 0, "Zero output");

        tokenIn.transferFrom(msg.sender, address(this), amountIn);
        tokenOut.transfer(msg.sender, amountOut);

        if (address(tokenIn) == address(tokenA)) {
            reserveA += amountIn;
            reserveB -= amountOut;
        } else {
            reserveB += amountIn;
            reserveA -= amountOut;
        }
        emit Swapped(msg.sender, address(tokenIn), address(tokenOut), amountIn, amountOut);
    }

    function sqrt(uint256 y) internal pure returns (uint256 z) {
        if (y > 3) {
            z = y;
            uint256 x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }
}