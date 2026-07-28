# 智能合约安全审计 · 从入门到赏金猎人

---

## 一、为什么这条路能赚 USDT

| 平台 | 赏金范围 | 特点 |
|------|----------|------|
| **Immunefi** | $500 - $10,000,000 | 最大漏洞赏金平台，按严重程度定价 |
| **Code4rena** | $500 - $50,000+ | 竞赛制，多人审计同一个项目 |
| **Sherlock** | $500 - $100,000+ | 审计+保险，发现漏洞即赏金 |
| **HackenProof** | $100 - $10,000+ | Web3 + 传统安全 |

**你的优势**：已经会写合约 = 已经懂"对的结构"。审计就是学会"错的模式"。

---

## 二、十大常见漏洞速查

### 1. 重入攻击 (Reentrancy)

```solidity
// ❌ 漏洞代码
function withdraw(uint256 amount) external {
    require(balances[msg.sender] >= amount);
    (bool success, ) = msg.sender.call{value: amount}("");
    require(success);
    balances[msg.sender] -= amount; // 状态更新在转账之后！
}

// ✅ 修复：先更新状态，再转账（CEI模式）
function withdraw(uint256 amount) external {
    require(balances[msg.sender] >= amount);
    balances[msg.sender] -= amount; // 先改状态
    (bool success, ) = msg.sender.call{value: amount}("");
    require(success);
}
```

**经典案例**：2016 The DAO 被攻击，损失 $60M，导致以太坊硬分叉。

### 2. 整数溢出 (Integer Overflow)

```solidity
// ❌ Solidity <0.8 的漏洞
uint8 x = 255;
x += 1; // x 变成 0！

// ✅ Solidity >=0.8 默认有溢出检查
// ✅ 或用 SafeMath 库
```

### 3. 闪电贷攻击 (Flash Loan)

攻击者借巨款→操纵价格预言机→套利→还款，在一个交易内完成。

**防御**：使用时间加权平均价格（TWAP）而非即时价格。

### 4. 访问控制缺陷

```solidity
// ❌ 忘记加 onlyOwner
function setRewardRate(uint256 rate) external {
    rewardRate = rate; // 任何人都能改！
}

// ✅ 加上修饰器
function setRewardRate(uint256 rate) external onlyOwner {
    rewardRate = rate;
}
```

### 5. 前端运行 (Frontrunning)

矿工/MEV 机器人看到你的交易在 mempool 里，抢在你前面执行相同的交易。

**防御**：commit-reveal 模式、使用 flashbots。

### 6. 预言机操纵 (Oracle Manipulation)

Uniswap 的即时价格可以被闪电贷临时操纵。

**防御**：使用 Chainlink 预言机，或 TWAP。

### 7. 签名重放 (Signature Replay)

同样的签名可以被不同合约/不同链上重放。

**防御**：在签名中包含 chainId、合约地址、nonce。

### 8. 未经检查的返回值

```solidity
// ❌ transfer 可能失败但不报错
token.transfer(to, amount); // 旧版不 revert

// ✅ 检查返回值或用 transferFrom
```

### 9. 精度损失 (Precision Loss)

除法在乘法之前导致精度损失。

```solidity
// ❌ 先除后乘，损失精度
uint fee = amount / 10000 * 30;

// ✅ 先乘后除
uint fee = amount * 30 / 10000;
```

### 10. 存储碰撞 (Storage Collision)

升级合约时新变量和旧变量占用同一存储槽，导致数据错乱。

**防御**：遵循 OpenZeppelin 升级模式，使用 gaps 预留槽位。

---

## 三、你的现有合约 · 潜在漏洞自查

### Counter.sol — ✅ 安全
简单的计数器，无外部调用，无 ETH 转账。唯一风险是 `decrement` 的 underflow 已经用 `require` 保护了。

### MyToken.sol — ✅ 安全
继承 OpenZeppelin 的标准实现，已经在社区审计过数百次。

### MyNFT.sol — ⚠️ 低风险
`withdraw()` 使用 `.transfer()` 在 Solidity 0.8 中是可接受的（transfer 有 2300 gas 限制），但最佳实践是使用 `.call{value:}("")`。

### Faucet.sol — ⚠️ 中风险
- 使用 `.transfer()` 向用户转账——如果接收方是合约且 fallback 函数消耗超过 2300 gas，转账会失败
- 没有 rate limiting 绕过的风险——用户可以用多个地址轮替

### SimpleDEX.sol — ⚠️ 中风险
- 没有滑点保护——用户可以 frontrun 交易
- 价格可以被闪电贷在单笔交易中操纵
- 应该添加 `minAmountOut` 参数

### Staking.sol — ✅ 基本安全
使用 `updateReward` 修饰器正确计算了奖励。但 `fundRewards` 依赖 owner 诚信。

### SimpleDAO.sol — ⚠️ 中风险
- 投票权重仅看当前余额——没有快照机制，用户可以投票后立即转走代币
- 需要快照（ERC-20 Snapshot 或 checkpoint 模式）

### MultiSigWallet.sol — ⚠️ 中风险
- 多签确认后自动执行（无时间锁）——如果攻击者控制了足够的 owner，可以立刻转走所有资金
- 建议加时间锁延迟

---

## 四、审计工具

### Slither（静态分析）
```bash
pip install slither-analyzer
slither contracts/ --solc-remaps @openzeppelin=node_modules/@openzeppelin
```

### Foundry（模糊测试）
```bash
# 安装
curl -L https://foundry.paradigm.xyz | bash
foundryup

# 创建并运行不变性测试
forge init --template foundry-rs/forge-template
forge test -vvvv
```

### Aderyn（Rust 写的静态分析器）
```bash
cargo install aderyn
aderyn .
```

---

## 五、练习平台（今天就能开始）

| 平台 | 难度 | 内容 |
|------|------|------|
| **Ethernaut** (ethernaut.openzeppelin.com) | 入门 | 26 关，每关一个漏洞 |
| **Damn Vulnerable DeFi** (damnvulnerabledefi.xyz) | 中级 | 18 关 DeFi 专题 |
| **Capture the Ether** | 入门-中级 | 经典 CTF |
| **Paradigm CTF** | 高级 | 顶级难度 |

---

## 六、如何提交第一个漏洞报告

### 报告模板
```
Title: [Protocol] - [Vulnerability Type] - [Impact]

Severity: Critical / High / Medium / Low

Description:
[用简单语言描述漏洞是什么]

Impact:
[攻击者能做什么，能偷多少钱]

Proof of Concept:
[附上可运行的 Hardhat/Foundry 测试代码]

Recommended Fix:
[建议怎么修]
```

### 提交流程
1. 找项目 → Immunefi 的 "Bug Bounty" 列表
2. 读代码 → 用 Slither 扫一遍，再手动读
3. 写 PoC → 用 Hardhat/Foundry 写攻击测试
4. 提交报告 → 按模板写，附 PoC
5. 等审核 → 通常 1-7 天回复

---

## 七、今天就能做的事

1. ☐ 安装 Slither：`pip install slither-analyzer`
2. ☐ 对你的 8 份合约跑 `slither contracts/`，看它发现了什么
3. ☐ 打开 ethernaut.openzeppelin.com → 注册 → 打第 1 关 (Fallback)
4. ☐ 打开 immunefi.com → 注册 → 浏览赏金列表