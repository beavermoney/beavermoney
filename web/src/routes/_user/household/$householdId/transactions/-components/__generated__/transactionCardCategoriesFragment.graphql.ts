/**
 * @generated SignedSource<<06dc2a35736ee36c550fa286f66a499a>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type transactionCardCategoriesFragment$data = {
  readonly " $fragmentSpreads": FragmentRefs<"editTransactionDialogCategoriesFragment">;
  readonly " $fragmentType": "transactionCardCategoriesFragment";
};
export type transactionCardCategoriesFragment$key = {
  readonly " $data"?: transactionCardCategoriesFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"transactionCardCategoriesFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "transactionCardCategoriesFragment",
  "selections": [
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "editTransactionDialogCategoriesFragment"
    }
  ],
  "type": "Query",
  "abstractKey": null
};

(node as any).hash = "b916b41dc2294d3a394fbcb13c182113";

export default node;
