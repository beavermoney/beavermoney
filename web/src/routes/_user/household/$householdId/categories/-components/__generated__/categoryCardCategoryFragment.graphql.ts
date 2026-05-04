/**
 * @generated SignedSource<<63d8e320c965a308587458f32b3322e9>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type TransactionCategoryType = "expense" | "income" | "investment" | "setup" | "transfer" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type categoryCardCategoryFragment$data = {
  readonly icon: string;
  readonly id: string;
  readonly name: string;
  readonly type: TransactionCategoryType;
  readonly " $fragmentType": "categoryCardCategoryFragment";
};
export type categoryCardCategoryFragment$key = {
  readonly " $data"?: categoryCardCategoryFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"categoryCardCategoryFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "categoryCardCategoryFragment",
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

(node as any).hash = "5bdd624de36890ee4a9fa4255bf43a0f";

export default node;
