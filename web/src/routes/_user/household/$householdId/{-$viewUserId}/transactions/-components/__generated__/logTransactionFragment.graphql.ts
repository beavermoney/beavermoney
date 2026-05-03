/**
 * @generated SignedSource<<c5cdd18679376ed451989861f0fa17d8>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type logTransactionFragment$data = {
  readonly " $fragmentSpreads": FragmentRefs<"newBuyFragment" | "newExpenseFragment" | "newIncomeFragment" | "newMoveFragment" | "newSellFragment" | "newTransferFragment">;
  readonly " $fragmentType": "logTransactionFragment";
};
export type logTransactionFragment$key = {
  readonly " $data"?: logTransactionFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"logTransactionFragment">;
};

const node: ReaderFragment = (function(){
var v0 = [
  {
    "kind": "Variable",
    "name": "viewUserId",
    "variableName": "viewUserId"
  }
];
return {
  "argumentDefinitions": [
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "viewUserId"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "logTransactionFragment",
  "selections": [
    {
      "args": (v0/*: any*/),
      "kind": "FragmentSpread",
      "name": "newExpenseFragment"
    },
    {
      "args": (v0/*: any*/),
      "kind": "FragmentSpread",
      "name": "newIncomeFragment"
    },
    {
      "args": (v0/*: any*/),
      "kind": "FragmentSpread",
      "name": "newTransferFragment"
    },
    {
      "args": (v0/*: any*/),
      "kind": "FragmentSpread",
      "name": "newBuyFragment"
    },
    {
      "args": (v0/*: any*/),
      "kind": "FragmentSpread",
      "name": "newSellFragment"
    },
    {
      "args": (v0/*: any*/),
      "kind": "FragmentSpread",
      "name": "newMoveFragment"
    }
  ],
  "type": "Household",
  "abstractKey": null
};
})();

(node as any).hash = "bd97002447ec479d0237daca787171c0";

export default node;
