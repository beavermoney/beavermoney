/**
 * @generated SignedSource<<e2bb3f30478292fe25cde43a4766d00e>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type UserHouseholdRole = "admin" | "member" | "%future added value";
export type membersSettingsUpdateRoleMutation$variables = {
  id: string;
  role: UserHouseholdRole;
};
export type membersSettingsUpdateRoleMutation$data = {
  readonly updateHouseholdUserRole: {
    readonly id: string;
    readonly role: UserHouseholdRole;
  };
};
export type membersSettingsUpdateRoleMutation = {
  response: membersSettingsUpdateRoleMutation$data;
  variables: membersSettingsUpdateRoleMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "role"
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
      },
      {
        "kind": "Variable",
        "name": "role",
        "variableName": "role"
      }
    ],
    "concreteType": "UserHousehold",
    "kind": "LinkedField",
    "name": "updateHouseholdUserRole",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "id",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "role",
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
    "name": "membersSettingsUpdateRoleMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "membersSettingsUpdateRoleMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "bec6ef4b33ad582a975ebd3d3f25930d",
    "id": null,
    "metadata": {},
    "name": "membersSettingsUpdateRoleMutation",
    "operationKind": "mutation",
    "text": "mutation membersSettingsUpdateRoleMutation(\n  $id: ID!\n  $role: UserHouseholdRole!\n) {\n  updateHouseholdUserRole(id: $id, role: $role) {\n    id\n    role\n  }\n}\n"
  }
};
})();

(node as any).hash = "76451fa6eb0125c1d07311fc1c1915b2";

export default node;
