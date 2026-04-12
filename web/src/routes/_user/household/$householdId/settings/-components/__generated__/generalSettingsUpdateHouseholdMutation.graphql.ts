/**
 * @generated SignedSource<<51660e6f2e1fa041ad36b52f9c8bfce2>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type UpdateHouseholdInput = {
  locale?: string | null | undefined;
  name?: string | null | undefined;
};
export type generalSettingsUpdateHouseholdMutation$variables = {
  id: string;
  input: UpdateHouseholdInput;
};
export type generalSettingsUpdateHouseholdMutation$data = {
  readonly updateHousehold: {
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
        "name": "input",
        "variableName": "input"
      }
    ],
    "concreteType": "Household",
    "kind": "LinkedField",
    "name": "updateHousehold",
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
        "name": "name",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "locale",
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
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "generalSettingsUpdateHouseholdMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "46253d3c720e142f91282c1bcead4512",
    "id": null,
    "metadata": {},
    "name": "generalSettingsUpdateHouseholdMutation",
    "operationKind": "mutation",
    "text": "mutation generalSettingsUpdateHouseholdMutation(\n  $id: ID!\n  $input: UpdateHouseholdInput!\n) {\n  updateHousehold(id: $id, input: $input) {\n    id\n    name\n    locale\n  }\n}\n"
  }
};
})();

(node as any).hash = "b452576cedef0c2b8467394230f3a697";

export default node;
