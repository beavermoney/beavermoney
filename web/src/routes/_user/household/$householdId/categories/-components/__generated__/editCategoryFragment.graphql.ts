/**
 * @generated SignedSource<<564a90bc392d57d279ca4a13ab97c707>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type TransactionCategoryType = "expense" | "income" | "investment" | "setup" | "transfer" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type editCategoryFragment$data = {
  readonly icon: string;
  readonly id: string;
  readonly name: string;
  readonly type: TransactionCategoryType;
  readonly " $fragmentType": "editCategoryFragment";
};
export type editCategoryFragment$key = {
  readonly " $data"?: editCategoryFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"editCategoryFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "editCategoryFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "name",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "type",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "icon",
      "storageKey": null
    }
  ],
  "type": "TransactionCategory",
  "abstractKey": null
};

(node as any).hash = "d26833a2c5a632b7f0482fb6be7eb1d2";

export default node;
