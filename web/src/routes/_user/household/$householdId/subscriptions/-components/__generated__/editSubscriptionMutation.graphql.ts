/**
 * @generated SignedSource<<407f31ae92d87b11b12199e6fdfea7a1>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type RecurringSubscriptionInterval = "month" | "week" | "year" | "%future added value";
export type UpdateRecurringSubscriptionInput = {
  active?: boolean | null | undefined;
  clearIcon?: boolean | null | undefined;
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
      readonly id: string;
      readonly interval: RecurringSubscriptionInterval;
      readonly intervalCount: number;
      readonly name: string;
      readonly startDate: any;
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
    "alias": null,
    "args": [
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
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "editSubscriptionMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "editSubscriptionMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "49df299143739297378da731499d0936",
    "id": null,
    "metadata": {},
    "name": "editSubscriptionMutation",
    "operationKind": "mutation",
    "text": "mutation editSubscriptionMutation(\n  $id: ID!\n  $input: UpdateRecurringSubscriptionInput!\n) {\n  updateRecurringSubscription(id: $id, input: $input) {\n    node {\n      id\n      name\n      interval\n      intervalCount\n      startDate\n      active\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "d776b23b60b5a37bd9931988be417c29";

export default node;
