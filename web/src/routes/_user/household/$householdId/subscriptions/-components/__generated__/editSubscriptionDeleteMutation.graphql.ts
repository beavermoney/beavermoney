/**
 * @generated SignedSource<<f63eb6700acbd14da995676db0eb98df>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type editSubscriptionDeleteMutation$variables = {
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
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
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
      }
    ],
    "concreteType": "DeleteRecurringSubscriptionPayload",
    "kind": "LinkedField",
    "name": "deleteRecurringSubscription",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "deletedRecurringSubscriptionId",
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
    "name": "editSubscriptionDeleteMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "editSubscriptionDeleteMutation",
    "selections": (v1/*: any*/)
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

(node as any).hash = "beec3bb3685184163e81a119e8d12e08";

export default node;
