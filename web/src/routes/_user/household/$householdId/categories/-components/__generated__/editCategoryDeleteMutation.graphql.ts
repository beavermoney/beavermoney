/**
 * @generated SignedSource<<bb2576f9c7c498859f11e4862fd614a1>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type editCategoryDeleteMutation$variables = {
  id: string;
};
export type editCategoryDeleteMutation$data = {
  readonly deleteTransactionCategory: boolean;
};
export type editCategoryDeleteMutation = {
  response: editCategoryDeleteMutation$data;
  variables: editCategoryDeleteMutation$variables;
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
    "name": "deleteTransactionCategory",
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "editCategoryDeleteMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "editCategoryDeleteMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "f2d76d403e35f9a9d9500a8e7f3664a1",
    "id": null,
    "metadata": {},
    "name": "editCategoryDeleteMutation",
    "operationKind": "mutation",
    "text": "mutation editCategoryDeleteMutation(\n  $id: ID!\n) {\n  deleteTransactionCategory(id: $id)\n}\n"
  }
};
})();

(node as any).hash = "e6546f7d5eb9034af70446e7a7ba483f";

export default node;
