/**
 * @generated SignedSource<<2129eb50a7ed172bdd8b1b734e8f4324>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type investmentArchiveActionArchiveMutation$variables = {
  id: string;
};
export type investmentArchiveActionArchiveMutation$data = {
  readonly archiveInvestment: {
    readonly archived: boolean;
    readonly id: string;
  };
};
export type investmentArchiveActionArchiveMutation = {
  response: investmentArchiveActionArchiveMutation$data;
  variables: investmentArchiveActionArchiveMutation$variables;
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
    "name": "archiveInvestment",
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
    "name": "investmentArchiveActionArchiveMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "investmentArchiveActionArchiveMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "517474a83b2e940955351f82941367ab",
    "id": null,
    "metadata": {},
    "name": "investmentArchiveActionArchiveMutation",
    "operationKind": "mutation",
    "text": "mutation investmentArchiveActionArchiveMutation(\n  $id: ID!\n) {\n  archiveInvestment(id: $id) {\n    id\n    archived\n  }\n}\n"
  }
};
})();

(node as any).hash = "d47117226999a8b4f3747c51d43fa95c";

export default node;
