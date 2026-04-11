/**
 * @generated SignedSource<<e953dfe6ab5ecdfbf3762472f6495038>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type RecurringSubscriptionInterval = "month" | "week" | "year" | "%future added value";
export type UpdateRecurringSubscriptionInput = {
  active?: boolean | null | undefined;
  clearIcon?: boolean | null | undefined;
  cost?: string | null | undefined;
  currencyID?: string | null | undefined;
  icon?: string | null | undefined;
  interval?: RecurringSubscriptionInterval | null | undefined;
  intervalCount?: number | null | undefined;
  name?: string | null | undefined;
  startDate?: any | null | undefined;
};
export type editSubscriptionMutation$variables = {
  id: string;
  input: UpdateRecurringSubscriptionInput;
};
export type editSubscriptionMutation$data = {
  readonly updateRecurringSubscription: {
    readonly node: {
      readonly active: boolean;
      readonly cost: string;
      readonly costInDisplayCurrency: string | null | undefined;
      readonly currency: {
        readonly code: string;
        readonly id: string;
      };
      readonly id: string;
      readonly interval: RecurringSubscriptionInterval;
      readonly intervalCount: number;
      readonly name: string;
      readonly startDate: any;
      readonly " $fragmentSpreads": FragmentRefs<"subscriptionCardFragment">;
    } | null | undefined;
  };
};
export type editSubscriptionMutation = {
  response: editSubscriptionMutation$data;
  variables: editSubscriptionMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "input"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
  },
  {
    "kind": "Variable",
    "name": "input",
    "variableName": "input"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "interval",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "intervalCount",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "startDate",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "cost",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "costInDisplayCurrency",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "concreteType": "Currency",
  "kind": "LinkedField",
  "name": "currency",
  "plural": false,
  "selections": [
    (v2/*: any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "code",
      "storageKey": null
    }
  ],
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "active",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "editSubscriptionMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "RecurringSubscriptionEdge",
        "kind": "LinkedField",
        "name": "updateRecurringSubscription",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "RecurringSubscription",
            "kind": "LinkedField",
            "name": "node",
            "plural": false,
            "selections": [
              (v2/*: any*/),
              (v3/*: any*/),
              (v4/*: any*/),
              (v5/*: any*/),
              (v6/*: any*/),
              (v7/*: any*/),
              (v8/*: any*/),
              (v9/*: any*/),
              (v10/*: any*/),
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "subscriptionCardFragment"
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "editSubscriptionMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "RecurringSubscriptionEdge",
        "kind": "LinkedField",
        "name": "updateRecurringSubscription",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "RecurringSubscription",
            "kind": "LinkedField",
            "name": "node",
            "plural": false,
            "selections": [
              (v2/*: any*/),
              (v3/*: any*/),
              (v4/*: any*/),
              (v5/*: any*/),
              (v6/*: any*/),
              (v7/*: any*/),
              (v8/*: any*/),
              (v9/*: any*/),
              (v10/*: any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "icon",
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "7b3be9ee8ade3ef6d01de5e9458bec3b",
    "id": null,
    "metadata": {},
    "name": "editSubscriptionMutation",
    "operationKind": "mutation",
    "text": "mutation editSubscriptionMutation(\n  $id: ID!\n  $input: UpdateRecurringSubscriptionInput!\n) {\n  updateRecurringSubscription(id: $id, input: $input) {\n    node {\n      id\n      name\n      interval\n      intervalCount\n      startDate\n      cost\n      costInDisplayCurrency\n      currency {\n        id\n        code\n      }\n      active\n      ...subscriptionCardFragment\n    }\n  }\n}\n\nfragment subscriptionCardFragment on RecurringSubscription {\n  id\n  name\n  icon\n  cost\n  costInDisplayCurrency\n  interval\n  intervalCount\n  startDate\n  currency {\n    code\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "2ca9941ca6d60fab00814338df7c1dd3";

export default node;
