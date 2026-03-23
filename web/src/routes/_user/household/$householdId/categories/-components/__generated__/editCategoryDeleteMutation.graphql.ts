/**
 * @generated SignedSource<<78ef84ef0dc976165941e853dd595ec1>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type editCategoryDeleteMutation$variables = {
  connections: ReadonlyArray<string>;
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
  "name": "deletedTransactionCategoryId",
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
    "name": "editCategoryDeleteMutation",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": "DeleteTransactionCategoryPayload",
        "kind": "LinkedField",
        "name": "deleteTransactionCategory",
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
    "name": "editCategoryDeleteMutation",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": "DeleteTransactionCategoryPayload",
        "kind": "LinkedField",
        "name": "deleteTransactionCategory",
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
            "name": "deletedTransactionCategoryId",
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
    "cacheID": "e3aff2291ea4d571c68f8c25f02de38d",
    "id": null,
    "metadata": {},
    "name": "editCategoryDeleteMutation",
    "operationKind": "mutation",
    "text": "mutation editCategoryDeleteMutation(\n  $id: ID!\n) {\n  deleteTransactionCategory(id: $id) {\n    deletedTransactionCategoryId\n  }\n}\n"
  }
};
})();

(node as any).hash = "84c02679b56af266c3936ae7b534aaf7";

export default node;
