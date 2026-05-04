/**
 * @generated SignedSource<<ace341b9ca2a062a5f9aa17370c7e0c5>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type editTransactionDialogDeleteMutation$variables = {
  connections: ReadonlyArray<string>;
  id: string;
};
export type editTransactionDialogDeleteMutation$data = {
  readonly deleteTransaction: {
    readonly deletedTransactionId: string;
  };
};
export type editTransactionDialogDeleteMutation = {
  response: editTransactionDialogDeleteMutation$data;
  variables: editTransactionDialogDeleteMutation$variables;
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
  "name": "deletedTransactionId",
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
    "name": "editTransactionDialogDeleteMutation",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": "DeleteTransactionPayload",
        "kind": "LinkedField",
        "name": "deleteTransaction",
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
    "name": "editTransactionDialogDeleteMutation",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": "DeleteTransactionPayload",
        "kind": "LinkedField",
        "name": "deleteTransaction",
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
            "name": "deletedTransactionId",
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
    "cacheID": "a974540f0924c8a4506dac864c8ba98b",
    "id": null,
    "metadata": {},
    "name": "editTransactionDialogDeleteMutation",
    "operationKind": "mutation",
    "text": "mutation editTransactionDialogDeleteMutation(\n  $id: ID!\n) {\n  deleteTransaction(id: $id) {\n    deletedTransactionId\n  }\n}\n"
  }
};
})();

(node as any).hash = "180be433465437a5bf5155914b8ea6cd";

export default node;
