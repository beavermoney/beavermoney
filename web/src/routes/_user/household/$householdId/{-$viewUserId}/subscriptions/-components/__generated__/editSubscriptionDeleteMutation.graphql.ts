/**
 * @generated SignedSource<<e756047a7225544c6a6184b3b1ded2dd>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type editSubscriptionDeleteMutation$variables = {
  connections: ReadonlyArray<string>;
  id: string;
};
export type editSubscriptionDeleteMutation$data = {
  readonly deleteRecurringSubscription: {
    readonly deletedRecurringSubscriptionId: string;
  };
};
export type editSubscriptionDeleteMutation = {
  response: editSubscriptionDeleteMutation$data;
  variables: editSubscriptionDeleteMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "connections"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "id"
},
v2 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
  }
],
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "deletedRecurringSubscriptionId",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "editSubscriptionDeleteMutation",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": "DeleteRecurringSubscriptionPayload",
        "kind": "LinkedField",
        "name": "deleteRecurringSubscription",
        "plural": false,
        "selections": [
          (v3/*: any*/)
        ],
        "storageKey": null
      }
    ],
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "editSubscriptionDeleteMutation",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": "DeleteRecurringSubscriptionPayload",
        "kind": "LinkedField",
        "name": "deleteRecurringSubscription",
        "plural": false,
        "selections": [
          (v3/*: any*/),
          {
            "alias": null,
            "args": null,
            "filters": null,
            "handle": "deleteEdge",
            "key": "",
            "kind": "ScalarHandle",
            "name": "deletedRecurringSubscriptionId",
            "handleArgs": [
              {
                "kind": "Variable",
                "name": "connections",
                "variableName": "connections"
              }
            ]
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "62a0d96875336fd1c088ee7bb962ccd6",
    "id": null,
    "metadata": {},
    "name": "editSubscriptionDeleteMutation",
    "operationKind": "mutation",
    "text": "mutation editSubscriptionDeleteMutation(\n  $id: ID!\n) {\n  deleteRecurringSubscription(id: $id) {\n    deletedRecurringSubscriptionId\n  }\n}\n"
  }
};
})();

(node as any).hash = "575045f72946ac9879c8cb36fc9c3da8";

export default node;
