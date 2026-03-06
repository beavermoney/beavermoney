/**
 * @generated SignedSource<<5d120f7b81efe8e9da0fcf8cb8c43a09>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type editAccountDeleteMutation$variables = {
  id: string;
};
export type editAccountDeleteMutation$data = {
  readonly deleteAccount: boolean;
};
export type editAccountDeleteMutation = {
  response: editAccountDeleteMutation$data;
  variables: editAccountDeleteMutation$variables;
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
    "name": "deleteAccount",
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "editAccountDeleteMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "editAccountDeleteMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "e99f44d63887f4bf9bb7cacbba3bdbae",
    "id": null,
    "metadata": {},
    "name": "editAccountDeleteMutation",
    "operationKind": "mutation",
    "text": "mutation editAccountDeleteMutation(\n  $id: ID!\n) {\n  deleteAccount(id: $id)\n}\n"
  }
};
})();

(node as any).hash = "7e519e0208de08c7910546c4408f44cc";

export default node;
