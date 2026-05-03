/**
 * @generated SignedSource<<c6a0faf5b763b9768bc97ac2fa522ea5>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type membersSettingsRemoveMutation$variables = {
  id: string;
};
export type membersSettingsRemoveMutation$data = {
  readonly removeHouseholdUser: {
    readonly removedUserHouseholdID: string;
  };
};
export type membersSettingsRemoveMutation = {
  response: membersSettingsRemoveMutation$data;
  variables: membersSettingsRemoveMutation$variables;
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
    "concreteType": "RemoveHouseholdUserPayload",
    "kind": "LinkedField",
    "name": "removeHouseholdUser",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "removedUserHouseholdID",
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
    "name": "membersSettingsRemoveMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "membersSettingsRemoveMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "37cc9f598c1dc544845ed26e42de2c10",
    "id": null,
    "metadata": {},
    "name": "membersSettingsRemoveMutation",
    "operationKind": "mutation",
    "text": "mutation membersSettingsRemoveMutation(\n  $id: ID!\n) {\n  removeHouseholdUser(id: $id) {\n    removedUserHouseholdID\n  }\n}\n"
  }
};
})();

(node as any).hash = "e4097ee237a1214c160ffb3ca5ad0ab9";

export default node;
