/**
 * @generated SignedSource<<b1744ba7417d00d5e097bfb1e1e9b37c>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type RecurringSubscriptionInterval = "month" | "week" | "year" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type editSubscriptionFragment$data = {
  readonly active: boolean;
  readonly icon: string | null | undefined;
  readonly id: string;
  readonly interval: RecurringSubscriptionInterval;
  readonly intervalCount: number;
  readonly name: string;
  readonly startDate: any;
  readonly " $fragmentType": "editSubscriptionFragment";
};
export type editSubscriptionFragment$key = {
  readonly " $data"?: editSubscriptionFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"editSubscriptionFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "editSubscriptionFragment",
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
      "name": "icon",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "interval",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "intervalCount",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "startDate",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "active",
      "storageKey": null
    }
  ],
  "type": "RecurringSubscription",
  "abstractKey": null
};

(node as any).hash = "8b961f7edc226ef7a2c4b43ca81768fc";

export default node;
