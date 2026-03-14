/**
 * @generated SignedSource<<4c7939affeccdbf007ccc136855bb563>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type netWorthChartQuery$variables = {
  createTimeGTE?: any | null | undefined;
};
export type netWorthChartQuery$data = {
  readonly checkpoints: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly createTime: any;
        readonly investment: string;
        readonly liability: string;
        readonly liquidity: string;
        readonly netWorth: string;
        readonly property: string;
        readonly receivable: string;
      } | null | undefined;
    } | null | undefined> | null | undefined;
  };
};
export type netWorthChartQuery = {
  response: netWorthChartQuery$data;
  variables: netWorthChartQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "createTimeGTE"
  }
],
v1 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 500
  },
  {
    "fields": [
      {
        "kind": "Variable",
        "name": "createTimeGTE",
        "variableName": "createTimeGTE"
      }
    ],
    "kind": "ObjectValue",
    "name": "where"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "createTime",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "netWorth",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "liquidity",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "investment",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "property",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "receivable",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "liability",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "netWorthChartQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "CheckpointConnection",
        "kind": "LinkedField",
        "name": "checkpoints",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "CheckpointEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "Checkpoint",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v2/*: any*/),
                  (v3/*: any*/),
                  (v4/*: any*/),
                  (v5/*: any*/),
                  (v6/*: any*/),
                  (v7/*: any*/),
                  (v8/*: any*/)
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "netWorthChartQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "CheckpointConnection",
        "kind": "LinkedField",
        "name": "checkpoints",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "CheckpointEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "Checkpoint",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v2/*: any*/),
                  (v3/*: any*/),
                  (v4/*: any*/),
                  (v5/*: any*/),
                  (v6/*: any*/),
                  (v7/*: any*/),
                  (v8/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "id",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "1071cd44d89b933140e58cf5cc27a265",
    "id": null,
    "metadata": {},
    "name": "netWorthChartQuery",
    "operationKind": "query",
    "text": "query netWorthChartQuery(\n  $createTimeGTE: Time\n) {\n  checkpoints(first: 500, where: {createTimeGTE: $createTimeGTE}) {\n    edges {\n      node {\n        createTime\n        netWorth\n        liquidity\n        investment\n        property\n        receivable\n        liability\n        id\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "274041d134585ff0f3c10e95e2704cc4";

export default node;
