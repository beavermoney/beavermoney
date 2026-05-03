/**
 * @generated SignedSource<<6135317c29bffbdbb26c494889da38dd>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type TransactionCategoryType = "expense" | "income" | "investment" | "setup" | "transfer" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type categoryCardFragment$data = {
  readonly id: string;
  readonly name: string;
  readonly type: TransactionCategoryType;
  readonly " $fragmentType": "categoryCardFragment";
};
export type categoryCardFragment$key = {
  readonly " $data"?: categoryCardFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"categoryCardFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "categoryCardFragment",
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
    }
  ],
  "type": "TransactionCategory",
  "abstractKey": null
};

(node as any).hash = "f79ee14c9ba231c9bcf4e1e15248c3f3";

export default node;
