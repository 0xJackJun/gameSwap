import { UpsertConfig, UpsertGameToken } from '../generated/ConfigAddress/ConfigAddress';
import { EventBetForToken, EventCreateGame } from '../generated/GameRouter/GameRouter';
import * as GamePairEvent from '../generated/templates/GamePair/GamePair';
import { ERC20Token, ConfigAddress, GameInfo, BetInfo, GamePair } from '../generated/schema';
import { ERC20 } from '../generated/ConfigAddress/ERC20';
import * as boutils from './boutils';
import { BigInt, ethereum, Bytes, log } from '@graphprotocol/graph-ts';

export function handleUpsertConfig(event: UpsertConfig): void {
  let id = event.params.factoryAddress.toHex();
  log.info('xxxxxxxxxxxxxxxxxx:handleUpsertConfig:' + id, []);
  let gstToken = ERC20Token.load(event.params.gstToken.toHexString());
  if (gstToken == null) {
    gstToken = new ERC20Token(event.params.gstToken.toHexString());
    gstToken.name = event.params.networkName + ' GST';
    gstToken.symbol = 'GST';
    gstToken.decimals = BigInt.fromI32(18);
    gstToken.save();
  }
  let wethToken = ERC20Token.load(event.params.wethToken.toHexString());
  if (wethToken == null) {
    wethToken = new ERC20Token(event.params.wethToken.toHexString());
    wethToken.name = event.params.networkName + ' WETH';
    wethToken.symbol = 'WETH';
    wethToken.decimals = BigInt.fromI32(18);
    wethToken.save();
  }
  let usdtToken = ERC20Token.load(event.params.usdtToken.toHexString());
  if (usdtToken == null) {
    usdtToken = new ERC20Token(event.params.usdtToken.toHexString());
    usdtToken.name = event.params.networkName + ' USDT';
    usdtToken.symbol = 'USDT';
    usdtToken.decimals = BigInt.fromI32(18);
    usdtToken.save();
  }
  let config = ConfigAddress.load(id);
  if (config == null) {
    config = new ConfigAddress(id);
    config.gameTokens = [];
  }
  config.factoryAddress = event.params.factoryAddress;
  config.routerAddress = event.params.routerAddress;
  config.gstToken = gstToken.id;
  config.wethToken = wethToken.id;
  config.usdtToken = usdtToken.id;
  config.networkName = event.params.networkName;
  config.rpcUrl = event.params.rpcUrl;
  config.blockUrl = event.params.blockUrl;
  config.chainId = event.params.chainId;
  config.timestamp = event.block.timestamp;
  config.save();
}
export function handleUpsertGameToken(event: UpsertGameToken): void {
  let id = event.params.factoryAddress.toHex();
  log.info('xxxxxxxxxxxxxxxxxx:handleUpsertGameToken:', []);
  var config = ConfigAddress.load(id);
  if (config == null) {
    log.info('please UpsertConfig first: {}', [id]);
    return;
  }
  let tokenId = event.params.tokenAddress.toHexString();
  let tokenName = boutils.getTokenSymbol(event.params.tokenAddress);
  var index = -2; // -1竟然不行,对ts还不熟悉。。。
  let gameTokens = config.gameTokens; //这里必须先复制,否则就存不进去,太奇怪了
  for (let i = 0; i < gameTokens.length; i++) {
    let token = ERC20Token.load(gameTokens[i]);
    // 这里需要检查是否已经无效
    if (token != null && token.symbol == event.params.tokenSymbol.toString()) {
      index = i;
      break;
    }
  }
  if (index != -2) {
    config.gameTokens.slice(index, 1);
  }
  let token = ERC20Token.load(event.params.tokenSymbol);
  if (token == null) {
    token = new ERC20Token(event.params.tokenAddress.toHex());
    //TODO 这里需要去合约里取token信息
    token.name = config.networkName + ' ' + event.params.tokenSymbol.toString();
    token.symbol = tokenName; //event.params.tokenSymbol.toString();
    token.decimals = boutils.getTokenDecimals(event.params.tokenAddress);
    token.save();
  }
  let tokens = config.gameTokens;
  let len = tokens.length;
  tokens.push(tokenId);
  tokens.sort();
  len = tokens.length;
  //config.unset("gameTokens");
  config.gameTokens = tokens;
  config.save();
  // */
}

export function handleEventCreateGame(event: EventCreateGame): void {
  let gameStr = event.params.gameStr;
  let deadline = event.params.deadline;
  //let id = event.params.token.toHex() + "-" + gameStr[0];
  let id = event.params.pair.toHex();
  log.info('xxxxxxxxxxxxxxxxxx:handleEventCreateGame:{}', [id]);
  var game = GameInfo.load(id);
  if (game != null) {
    log.info('GameInfo oready exist: {}', [id]);
    return;
  }
  let gamePair = new GamePair(event.params.pair.toHex());
  gamePair.title = gameStr[0];
  gamePair.locked = BigInt.fromI32(0);
  gamePair.save();

  game = new GameInfo(id);
  game.title = gameStr[0];
  game.token = event.params.token.toHex();
  game.pair = gamePair.id;
  game.url = gameStr[1];
  game.options = gameStr[2];
  game.startSec = deadline[0];
  game.endSec = deadline[1];
  game.deadline = deadline[2];
  game.initAmountsIn = event.params.amountsIn;
  game.amount = event.params.amount;
  game.side = event.params.side;
  game.timestamp = event.block.timestamp;
  game.save();
}
export function handleEventBetForToken(event: EventBetForToken): void {
  let id = event.params.pair.toHex() + '-' + event.params.sender.toHex() + '-' + event.block.timestamp.toString();
  log.info('xxxxxxxxxxxxxxxxxx:handleEventCreateGame:{}', [id]);
  var bet = BetInfo.load(id);
  if (bet != null) {
    log.error('BetInfo oready exist: {}', [id]);
    return;
  }

  bet = new BetInfo(id);
  bet.sender = event.params.sender;
  bet.token = event.params.token;

  bet.gameInfo = event.params.pair.toHex();
  bet.amount = event.params.amount;
  bet.deadline = event.params.deadline;
  bet.side = event.params.side;
  bet.save();
}
export function handleTransfer(event: GamePairEvent.Approval): void {
  let pair = GamePair.load(event.address.toHex());
  if (pair == null) {
    log.error('handleTransfer GamePair not find: {}', [event.address.toHex()]);
    return;
  }
  let pairContract = GamePairEvent.GamePair.bind(event.address);
  pair.title = pairContract.title();
  pair.save();
}
export function handleApproval(event: GamePairEvent.Approval): void {
  let pair = GamePair.load(event.address.toHex());
  if (pair == null) {
    log.error('handleTransfer GamePair not find: {}', [event.address.toHex()]);
    return;
  }
  let pairContract = GamePairEvent.GamePair.bind(event.address);
  pair.title = pairContract.title();
  pair.save();
}
export function handleBlock(block: ethereum.Block): void {
  let id = block.hash.toHex();
  log.info('xxxxxxxxxxxxxxxxxx:wwwwwwwww:' + id, []);
  //let entity = new Block(id)
  //entity.save()
}
