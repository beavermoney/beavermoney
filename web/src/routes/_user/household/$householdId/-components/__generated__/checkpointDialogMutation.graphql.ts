/**
 * @generated SignedSource<<bce6789924510d55fc7ee2909547969b>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type CreateCheckpointInput = {
  note?: string | null | undefined;
};
export type checkpointDialogMutation$variables = {
  input: CreateCheckpointInput;
};
export type checkpointDialogMutation$data = {
  readonly createCheckpoint: {
    readonly node: {
      readonly createTime: any;
      readonly id: string;
      readonly investment: string;
      readonly liability: string;
      readonly liquidity: string;
      readonly netWorth: string;
      readonly property: string;
      readonly receivable: string;
    } | null | undefined;
  };
};
export type checkpointDialogMutation = {
  response: checkpointDialogMutation$data;
  variables: checkpointDialogMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
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
        "name": "input",
        "variableName": "input"
      }
    ],
    "concreteType": "CheckpointEdge",
    "kind": "LinkedField",
    "name": "createCheckpoint",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "Checkpoint",
        "kind": "LinkedField",
        "name": "node",
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
            "name": "netWorth",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "liquidity",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "investment",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "property",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "receivable",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "liability",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "createTime",
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
    "name": "checkpointDialogMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "checkpointDialogMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "ae021fa0e05bcdf18d069b00fb260dc3",
    "id": null,
    "metadata": {},
    "name": "checkpointDialogMutation",
    "operationKind": "mutation",
    "text": "mutation checkpointDialogMutation(\n  $input: CreateCheckpointInput!\n) {\n  createCheckpoint(input: $input) {\n    node {\n      id\n      netWorth\n      liquidity\n      investment\n      property\n      receivable\n      liability\n      createTime\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "9ff365af260081fd7e3cfd468339c701";

export default node;
