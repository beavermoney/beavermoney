/**
 * @generated SignedSource<<480f7ce37db7a49730ca8eb7c405cc85>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type RecurringSubscriptionInterval = "month" | "week" | "year" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type subscriptionCardFragment$data = {
  readonly cost: string;
  readonly costInDisplayCurrency: string | null | undefined;
  readonly currency: {
    readonly code: string;
  };
  readonly icon: string | null | undefined;
  readonly id: string;
  readonly interval: RecurringSubscriptionInterval;
  readonly intervalCount: number;
  readonly name: string;
  readonly startDate: any;
  readonly " $fragmentType": "subscriptionCardFragment";
};
export type subscriptionCardFragment$key = {
  readonly " $data"?: subscriptionCardFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"subscriptionCardFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "subscriptionCardFragment",
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
      "name": "cost",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "costInDisplayCurrency",
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
      "concreteType": "Currency",
      "kind": "LinkedField",
      "name": "currency",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "code",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "RecurringSubscription",
  "abstractKey": null
};

(node as any).hash = "b37b0c1e0eb42aa0717c1b315431c8c5";

export default node;
