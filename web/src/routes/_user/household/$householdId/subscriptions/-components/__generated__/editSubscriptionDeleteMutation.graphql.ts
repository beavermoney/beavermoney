/**
 * @generated SignedSource<<9cbd03907696b1ccae08e722ef8bf5db>>
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
  readonly deleteRecurringSubscription: boolean;
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
    "kind": "ScalarField",
    "name": "deleteRecurringSubscription",
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
    "cacheID": "df6c6b48086da8c1705ab80ad07d5dc9",
    "id": null,
    "metadata": {},
    "name": "editSubscriptionDeleteMutation",
    "operationKind": "mutation",
    "text": "mutation editSubscriptionDeleteMutation(\n  $id: ID!\n) {\n  deleteRecurringSubscription(id: $id)\n}\n"
  }
};
})();

(node as any).hash = "2e7aa522adee4a3e70c811bdbadc974c";

export default node;
