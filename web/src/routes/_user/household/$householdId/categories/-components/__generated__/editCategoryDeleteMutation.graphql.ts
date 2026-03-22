/**
 * @generated SignedSource<<44c07b1772a8911b61da9df3c704ff3d>>
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
  readonly deleteTransactionCategory: {
    readonly deletedTransactionCategoryId: string;
  };
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
    "concreteType": "DeleteTransactionCategoryPayload",
    "kind": "LinkedField",
    "name": "deleteTransactionCategory",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "deletedTransactionCategoryId",
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
    "cacheID": "e3aff2291ea4d571c68f8c25f02de38d",
    "id": null,
    "metadata": {},
    "name": "editCategoryDeleteMutation",
    "operationKind": "mutation",
    "text": "mutation editCategoryDeleteMutation(\n  $id: ID!\n) {\n  deleteTransactionCategory(id: $id) {\n    deletedTransactionCategoryId\n  }\n}\n"
  }
};
})();

(node as any).hash = "64786638a9d1a3f225fd9e9ef267b48f";

export default node;
