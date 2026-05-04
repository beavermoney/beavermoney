/**
 * @generated SignedSource<<4349662c131c1dd136e609ce70a71668>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type UserHouseholdRole = "admin" | "member" | "%future added value";
export type AddHouseholdUserInput = {
  email: string;
  householdCurrencyID: string;
  role: UserHouseholdRole;
};
export type addMemberDialogMutation$variables = {
  input: AddHouseholdUserInput;
};
export type addMemberDialogMutation$data = {
  readonly addHouseholdUser: {
    readonly householdCurrency: {
      readonly code: string;
      readonly id: string;
    };
    readonly id: string;
    readonly role: UserHouseholdRole;
    readonly user: {
      readonly email: string | null | undefined;
      readonly id: string;
      readonly name: string;
    };
  };
};
export type addMemberDialogMutation = {
  response: addMemberDialogMutation$data;
  variables: addMemberDialogMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "input"
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v2 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "input",
        "variableName": "input"
      }
    ],
    "concreteType": "UserHousehold",
    "kind": "LinkedField",
    "name": "addHouseholdUser",
    "plural": false,
    "selections": [
      (v1/*: any*/),
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "role",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "HouseholdCurrency",
        "kind": "LinkedField",
        "name": "householdCurrency",
        "plural": false,
        "selections": [
          (v1/*: any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "code",
            "storageKey": null
          }
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "user",
        "plural": false,
        "selections": [
          (v1/*: any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "name",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "email",
            "storageKey": null
          }
        ],
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
    "name": "addMemberDialogMutation",
    "selections": (v2/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "addMemberDialogMutation",
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "54545efc0e64d172b1db921a6c5ba3f7",
    "id": null,
    "metadata": {},
    "name": "addMemberDialogMutation",
    "operationKind": "mutation",
    "text": "mutation addMemberDialogMutation(\n  $input: AddHouseholdUserInput!\n) {\n  addHouseholdUser(input: $input) {\n    id\n    role\n    householdCurrency {\n      id\n      code\n    }\n    user {\n      id\n      name\n      email\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "18dd79a1d7c8ca9425696b79fa018784";

export default node;
