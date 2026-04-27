/**
 * @generated SignedSource<<c9c9d0e15850872fd318388432d178eb>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type routeAccountIdDeleteMutation$variables = {
  connections: ReadonlyArray<string>;
  id: string;
};
export type routeAccountIdDeleteMutation$data = {
  readonly deleteAccount: {
    readonly deletedAccountId: string;
  };
};
export type routeAccountIdDeleteMutation = {
  response: routeAccountIdDeleteMutation$data;
  variables: routeAccountIdDeleteMutation$variables;
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
    "name": "routeAccountIdDeleteMutation",
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
    "name": "routeAccountIdDeleteMutation",
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
    "cacheID": "7409033aaca0aaa16739ef629cbb7aaa",
    "id": null,
    "metadata": {},
    "name": "routeAccountIdDeleteMutation",
    "operationKind": "mutation",
    "text": "mutation routeAccountIdDeleteMutation(\n  $id: ID!\n) {\n  deleteAccount(id: $id) {\n    deletedAccountId\n  }\n}\n"
  }
};
})();

(node as any).hash = "3cc350d7e0ad26f61419add0529a3cb8";

export default node;
