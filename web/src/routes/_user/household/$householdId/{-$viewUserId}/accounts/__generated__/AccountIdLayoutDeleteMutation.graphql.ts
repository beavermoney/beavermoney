/**
 * @generated SignedSource<<7bc4bfdbfa9d82a707e31e142c539c36>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type AccountIdLayoutDeleteMutation$variables = {
  connections: ReadonlyArray<string>;
  id: string;
};
export type AccountIdLayoutDeleteMutation$data = {
  readonly deleteAccount: {
    readonly deletedAccountId: string;
  };
};
export type AccountIdLayoutDeleteMutation = {
  response: AccountIdLayoutDeleteMutation$data;
  variables: AccountIdLayoutDeleteMutation$variables;
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
  "name": "deletedAccountId",
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
    "name": "AccountIdLayoutDeleteMutation",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": "DeleteAccountPayload",
        "kind": "LinkedField",
        "name": "deleteAccount",
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
    "name": "AccountIdLayoutDeleteMutation",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": "DeleteAccountPayload",
        "kind": "LinkedField",
        "name": "deleteAccount",
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
            "name": "deletedAccountId",
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
    "cacheID": "0b5b6380872a5468ed1baab27c34747f",
    "id": null,
    "metadata": {},
    "name": "AccountIdLayoutDeleteMutation",
    "operationKind": "mutation",
    "text": "mutation AccountIdLayoutDeleteMutation(\n  $id: ID!\n) {\n  deleteAccount(id: $id) {\n    deletedAccountId\n  }\n}\n"
  }
};
})();

(node as any).hash = "7a594f559c748e474cdfa577392a9f70";

export default node;
