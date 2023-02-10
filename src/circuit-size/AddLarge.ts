import {
  Field,
  SmartContract,
  state,
  State,
  method,
  Poseidon,
  Circuit,
} from 'snarkyjs';

/**
 * Basic Example
 * See https://docs.minaprotocol.com/zkapps for more info.
 *
 * The Add contract initializes the state variable 'num' to be a Field(1) value by default when deployed.
 * When the 'update' method is called, the Add contract adds Field(2) to its 'num' contract state.
 *
 * This file is safe to delete and replace with your own contract.
 */
export class AddLarge extends SmartContract {
  @state(Field) num = State<Field>();
  @state(Field) unrelatedState = State<Field>();

  init() {
    super.init();
    this.num.set(Field(1));
  }

  @method update() {
    const currentState = this.num.get();
    this.num.assertEquals(currentState); // precondition that links this.num.get() to the actual on-chain state
    const newState = currentState.add(2);
    this.num.set(newState);
  }

  @method large() {
    let x = Poseidon.hash([Field(0)]);
    for (let i = 0; i < 256; i++) {
      const f = Field(i);
      x = Circuit.if(
        f.gt(10),
        (() => Poseidon.hash([x, f]))(),
        (() => Poseidon.hash([f, x]))()
      );
    }

    const currentState = this.unrelatedState.get();
    this.unrelatedState.assertEquals(currentState);
    this.unrelatedState.set(x);
  }
}
