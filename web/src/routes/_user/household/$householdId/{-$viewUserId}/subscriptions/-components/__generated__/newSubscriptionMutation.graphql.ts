/**
 * @generated SignedSource<<da880c78e3df9c7ec9aa657f4699f532>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type RecurringSubscriptionInterval = "month" | "week" | "year" | "%future added value";
export type CreateRecurringSubscriptionInput = {
  active?: boolean | null | undefined;
  cost?: string | null | undefined;
  householdCurrencyID: string;
  icon?: string | null | undefined;
  interval: RecurringSubscriptionInterval;
  intervalCount?: number | null | undefined;
  name: string;
  startDate: any;
  userID: string;
};
export type newSubscriptionMutation$variables = {
  input: CreateRecurringSubscriptionInput;
};
export type newSubscriptionMutation$data = {
  readonly createRecurringSubscription: {
    readonly node: {
      readonly active: boolean;
      readonly cost: string;
      readonly householdCurrency: {
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
export type newSubscriptionMutation = {
  response: newSubscriptionMutation$data;
  variables: newSubscriptionMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "input"
  }
],
v1 = [
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
  "concreteType": "HouseholdCurrency",
  "kind": "LinkedField",
  "name": "householdCurrency",
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
v9 = {
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
    "name": "newSubscriptionMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "RecurringSubscriptionEdge",
        "kind": "LinkedField",
        "name": "createRecurringSubscription",
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
    "name": "newSubscriptionMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "RecurringSubscriptionEdge",
        "kind": "LinkedField",
        "name": "createRecurringSubscription",
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
    "cacheID": "3583015b3279c7fdf0c95f3f775f975e",
    "id": null,
    "metadata": {},
    "name": "newSubscriptionMutation",
    "operationKind": "mutation",
    "text": "mutation newSubscriptionMutation(\n  $input: CreateRecurringSubscriptionInput!\n) {\n  createRecurringSubscription(input: $input) {\n    node {\n      id\n      name\n      interval\n      intervalCount\n      startDate\n      cost\n      householdCurrency {\n        id\n        code\n      }\n      active\n      ...subscriptionCardFragment\n    }\n  }\n}\n\nfragment subscriptionCardFragment on RecurringSubscription {\n  id\n  name\n  icon\n  cost\n  interval\n  intervalCount\n  startDate\n  householdCurrency {\n    code\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "9bd0e92ba9c508a56e958a3ade083dfe";

export default node;
