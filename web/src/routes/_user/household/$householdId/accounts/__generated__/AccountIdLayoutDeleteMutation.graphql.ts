/**
 * @generated SignedSource<<d724411a1d7c2c548d645a5c748386f0>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type AccountIdLayoutDeleteMutation$variables = {
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
    "concreteType": "DeleteAccountPayload",
    "kind": "LinkedField",
    "name": "deleteAccount",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "deletedAccountId",
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
    "name": "AccountIdLayoutDeleteMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "AccountIdLayoutDeleteMutation",
    "selections": (v1/*: any*/)
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

(node as any).hash = "805c18f55c5145b758b614f7934457a5";

export default node;
