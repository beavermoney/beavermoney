/**
 * @generated SignedSource<<0b94915359eaa14172d7d50339e10210>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type investmentArchiveActionRestoreMutation$variables = {
  id: string;
};
export type investmentArchiveActionRestoreMutation$data = {
  readonly unarchiveInvestment: {
    readonly archived: boolean;
    readonly id: string;
  };
};
export type investmentArchiveActionRestoreMutation = {
  response: investmentArchiveActionRestoreMutation$data;
  variables: investmentArchiveActionRestoreMutation$variables;
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
    "concreteType": "Investment",
    "kind": "LinkedField",
    "name": "unarchiveInvestment",
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
        "name": "archived",
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
    "name": "investmentArchiveActionRestoreMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "investmentArchiveActionRestoreMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "7207340d8f5a760978014a5cffb5b394",
    "id": null,
    "metadata": {},
    "name": "investmentArchiveActionRestoreMutation",
    "operationKind": "mutation",
    "text": "mutation investmentArchiveActionRestoreMutation(\n  $id: ID!\n) {\n  unarchiveInvestment(id: $id) {\n    id\n    archived\n  }\n}\n"
  }
};
})();

(node as any).hash = "c150da36e3e1c434b7163bc08f701a99";

export default node;
