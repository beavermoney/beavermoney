/**
 * @generated SignedSource<<f8dc71b839f26333cde502a3bc8ff4b1>>
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
  readonly deleteAccount: boolean;
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
    "cacheID": "fa26630a436f39e305ed43ea316cae1c",
    "id": null,
    "metadata": {},
    "name": "AccountIdLayoutDeleteMutation",
    "operationKind": "mutation",
    "text": "mutation AccountIdLayoutDeleteMutation(\n  $id: ID!\n) {\n  deleteAccount(id: $id)\n}\n"
  }
};
})();

(node as any).hash = "6bba7d745ea00791389cafa39178a047";

export default node;
