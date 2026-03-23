/**
 * @generated SignedSource<<005668286641c3fd0db007ba10913021>>
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

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "logTransactionFragment",
  "selections": [
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "newExpenseFragment"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "newIncomeFragment"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "newTransferFragment"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "newBuyFragment"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "newSellFragment"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "newMoveFragment"
    }
  ],
  "type": "Household",
  "abstractKey": null
};

(node as any).hash = "2c01f7fd907b60a7c080eb1b87d71d92";

export default node;
