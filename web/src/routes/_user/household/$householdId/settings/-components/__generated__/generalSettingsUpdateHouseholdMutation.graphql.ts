/**
 * @generated SignedSource<<e8ce0aae90bd1ed0f82a4b78f1347f88>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type UpdateHouseholdInput = {
  currencyID?: string | null | undefined;
  locale?: string | null | undefined;
  name?: string | null | undefined;
};
export type generalSettingsUpdateHouseholdMutation$variables = {
  id: string;
  input: UpdateHouseholdInput;
};
export type generalSettingsUpdateHouseholdMutation$data = {
  readonly updateHousehold: {
    readonly currency: {
      readonly code: string;
      readonly id: string;
    };
    readonly id: string;
    readonly locale: string;
    readonly name: string;
  };
};
export type generalSettingsUpdateHouseholdMutation = {
  response: generalSettingsUpdateHouseholdMutation$data;
  variables: generalSettingsUpdateHouseholdMutation$variables;
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
        "name": "id",
        "variableName": "id"
      },
      {
        "kind": "Variable",
        "name": "input",
        "variableName": "input"
      }
    ],
    "concreteType": "Household",
    "kind": "LinkedField",
    "name": "updateHousehold",
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
        "name": "locale",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "Currency",
        "kind": "LinkedField",
        "name": "currency",
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
    "name": "generalSettingsUpdateHouseholdMutation",
    "selections": (v2/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "generalSettingsUpdateHouseholdMutation",
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "c86b10aff72b36ce48ad4f90bf1b20c9",
    "id": null,
    "metadata": {},
    "name": "generalSettingsUpdateHouseholdMutation",
    "operationKind": "mutation",
    "text": "mutation generalSettingsUpdateHouseholdMutation(\n  $id: ID!\n  $input: UpdateHouseholdInput!\n) {\n  updateHousehold(id: $id, input: $input) {\n    id\n    name\n    locale\n    currency {\n      id\n      code\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "d075b5b254d0670eb97267881dc3f75c";

export default node;
