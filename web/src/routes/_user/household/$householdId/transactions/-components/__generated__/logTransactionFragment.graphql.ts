/**
 * @generated SignedSource<<37e680a4ed4a9bfaf22e1a961a2d28f6>>
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
    "name": "viewUserIds",
    "variableName": "viewUserIds"
  }
];
return {
  "argumentDefinitions": [
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "viewUserIds"
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

(node as any).hash = "0866a2ca773e8dc872a31b4026b5ddfd";

export default node;
