import { AddSmall } from './AddSmall';
import { AddLarge } from './AddLarge';
import {
  AccountUpdate,
  isReady,
  Mina,
  PrivateKey,
  PublicKey,
  shutdown,
} from 'snarkyjs';

await isReady;
let deployerAccount: PublicKey,
  deployerKey: PrivateKey,
  addSmallAddress: PublicKey,
  addSmallPrivateKey: PrivateKey,
  addSmall: AddSmall,
  addLargeAddress: PublicKey,
  addLargePrivateKey: PrivateKey,
  addLarge: AddLarge;

const Local = Mina.LocalBlockchain();
Mina.setActiveInstance(Local);
({ privateKey: deployerKey, publicKey: deployerAccount } =
  Local.testAccounts[0]);
addSmallPrivateKey = PrivateKey.random();
addSmallAddress = addSmallPrivateKey.toPublicKey();
addSmall = new AddSmall(addSmallAddress);
addLargePrivateKey = PrivateKey.random();
addLargeAddress = addLargePrivateKey.toPublicKey();
addLarge = new AddLarge(addLargeAddress);

const txn = await Mina.transaction(deployerAccount, () => {
  AccountUpdate.fundNewAccount(deployerAccount);
  addSmall.deploy();
  addLarge.deploy();
});
await txn.prove();
await txn.sign([deployerKey, addSmallPrivateKey, addLargePrivateKey]).send();

// Contracts are deployed.

const n = 10;
console.time('Small Circuit');
for (let i = 0; i < n; i++) {
  const t = await Mina.transaction(deployerAccount, () => {
    addSmall.update();
  });
  await t.prove();
  await t.sign([deployerKey]).send();
}
console.timeEnd('Small Circuit');

console.time('Large Circuit');
for (let i = 0; i < n; i++) {
  const t = await Mina.transaction(deployerAccount, () => {
    addLarge.update();
  });
  await t.prove();
  await t.sign([deployerKey]).send();
}
console.timeEnd('Large Circuit');

await shutdown();
