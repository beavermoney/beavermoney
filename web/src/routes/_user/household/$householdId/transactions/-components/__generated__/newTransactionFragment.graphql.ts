/**
 * @generated SignedSource<<8270720c3d49009e599780cfab4a0113>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type newTransactionFragment$data = {
  readonly " $fragmentSpreads": FragmentRefs<"newExpenseFragment" | "newIncomeFragment" | "newTransferFragment">;
  readonly " $fragmentType": "newTransactionFragment";
};
export type newTransactionFragment$key = {
  readonly " $data"?: newTransactionFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"newTransactionFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "newTransactionFragment",
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
    }
  ],
  "type": "Query",
  "abstractKey": null
};

(node as any).hash = "816f0228f0a53ae98b77b5a57c991c77";

export default node;
