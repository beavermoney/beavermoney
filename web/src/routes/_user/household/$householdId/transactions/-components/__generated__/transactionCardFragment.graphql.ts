/**
 * @generated SignedSource<<483e0949ba6af1d7c767584dfee31875>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type transactionCardFragment$data = {
  readonly category: {
    readonly name: string;
  };
  readonly investmentLots: ReadonlyArray<{
    readonly amount: string;
    readonly id: string;
    readonly " $fragmentSpreads": FragmentRefs<"investmentLotCardFragment">;
  }> | null | undefined;
  readonly transactionEntries: ReadonlyArray<{
    readonly amount: string;
    readonly id: string;
    readonly " $fragmentSpreads": FragmentRefs<"transactionEntryCardFragment">;
  }> | null | undefined;
  readonly " $fragmentSpreads": FragmentRefs<"editTransactionDialogFragment">;
  readonly " $fragmentType": "transactionCardFragment";
};
export type transactionCardFragment$key = {
  readonly " $data"?: transactionCardFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"transactionCardFragment">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "amount",
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "transactionCardFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "TransactionEntry",
      "kind": "LinkedField",
      "name": "transactionEntries",
      "plural": true,
      "selections": [
        (v0/*: any*/),
        (v1/*: any*/),
        {
          "args": null,
          "kind": "FragmentSpread",
          "name": "transactionEntryCardFragment"
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "InvestmentLot",
      "kind": "LinkedField",
      "name": "investmentLots",
      "plural": true,
      "selections": [
        (v0/*: any*/),
        (v1/*: any*/),
        {
          "args": null,
          "kind": "FragmentSpread",
          "name": "investmentLotCardFragment"
        }
      ],
      "storageKey": null
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "editTransactionDialogFragment"
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "TransactionCategory",
      "kind": "LinkedField",
      "name": "category",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "name",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "Transaction",
  "abstractKey": null
};
})();

(node as any).hash = "0390493e019aa6263274bc23a9c6a74e";

export default node;
