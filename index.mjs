import { ApiPromise, WsProvider } from '@polkadot/api';

function getCount (list) {
  const short = list.filter((_, index) => index < 3).map((i) => i.toString().slice(0, 4));

  if (list.length > 3) {
    short.push('…');
  }

  return `${list.length.toString().padStart(3)} [${short.join(', ')}]`;
}

async function query () {
  const provider = new WsProvider('wss://rpc.polkadot.io');
  const api = await ApiPromise.create({ provider });
  let blockNumber = 0;

  while (true) {
    const blockHash = await api.rpc.chain.getBlockHash(blockNumber);
    const [v, _d] = await Promise.all([
      // Vec<AccountId>
      api.query.session.validators.at(blockHash),
      // Vec<u32>
      api.query.session.disabledValidators.at(blockHash)
    ]);

    // map disabled indexes to validatorId
    const d = _d.map((i) => v[i.toNumber()]);

    console.log(new Date(), blockNumber.toString().padStart(9), blockHash.toHex(), getCount(v), getCount(d));

    blockNumber++;
  }
}

query().catch((error) => {
  console.error(error);

  process.exit(-1);
});

