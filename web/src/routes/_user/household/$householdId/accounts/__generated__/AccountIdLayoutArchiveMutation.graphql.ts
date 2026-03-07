/**
 * @generated SignedSource<<53761473bb96abbf6658833efa11d53d>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type AccountIdLayoutArchiveMutation$variables = {
  id: string;
};
export type AccountIdLayoutArchiveMutation$data = {
  readonly archiveAccount: boolean;
};
export type AccountIdLayoutArchiveMutation = {
  response: AccountIdLayoutArchiveMutation$data;
  variables: AccountIdLayoutArchiveMutation$variables;
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
    "name": "archiveAccount",
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "AccountIdLayoutArchiveMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "AccountIdLayoutArchiveMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "46da0f50a0f6ef257273194e59901804",
    "id": null,
    "metadata": {},
    "name": "AccountIdLayoutArchiveMutation",
    "operationKind": "mutation",
    "text": "mutation AccountIdLayoutArchiveMutation(\n  $id: ID!\n) {\n  archiveAccount(id: $id)\n}\n"
  }
};
})();

(node as any).hash = "f213e40ae2d8b035a5ecb3bf16b5eb52";

export default node;
