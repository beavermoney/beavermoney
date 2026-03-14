/**
 * @generated SignedSource<<6eaf42f0ff802d545080db9a2a45c9e7>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type AccountsQuery$variables = Record<PropertyKey, never>;
export type AccountsQuery$data = {
  readonly " $fragmentSpreads": FragmentRefs<"accountsPanelFragment">;
};
export type AccountsQuery = {
  response: AccountsQuery$data;
  variables: AccountsQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 50
  },
  {
    "kind": "Literal",
    "name": "where",
    "value": {
      "archived": false
    }
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "cursor",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "concreteType": "PageInfo",
  "kind": "LinkedField",
  "name": "pageInfo",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "endCursor",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "hasNextPage",
      "storageKey": null
    }
  ],
  "storageKey": null
},
v6 = [
  "where"
],
v7 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 500
  },
  {
    "kind": "Literal",
    "name": "where",
    "value": {
      "createTimeGTE": "2020-01-01T00:00:00Z"
    }
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "AccountsQuery",
    "selections": [
      {
        "args": null,
        "kind": "FragmentSpread",
        "name": "accountsPanelFragment"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "AccountsQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": "AccountConnection",
        "kind": "LinkedField",
        "name": "accounts",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "AccountEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "Account",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v1/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "type",
                    "storageKey": null
                  },
                  (v2/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "valueInHouseholdCurrency",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "icon",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "updateTime",
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
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "code",
                        "storageKey": null
                      },
                      (v1/*: any*/)
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
                      (v2/*: any*/),
                      (v1/*: any*/)
                    ],
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "value",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "balance",
                    "storageKey": null
                  },
                  (v3/*: any*/)
                ],
                "storageKey": null
              },
              (v4/*: any*/)
            ],
            "storageKey": null
          },
          (v5/*: any*/)
        ],
        "storageKey": "accounts(first:50,where:{\"archived\":false})"
      },
      {
        "alias": null,
        "args": (v0/*: any*/),
        "filters": (v6/*: any*/),
        "handle": "connection",
        "key": "accountsPanel_accounts",
        "kind": "LinkedHandle",
        "name": "accounts"
      },
      {
        "alias": null,
        "args": (v7/*: any*/),
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
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "createTime",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "netWorth",
                    "storageKey": null
                  },
                  (v1/*: any*/),
                  (v3/*: any*/)
                ],
                "storageKey": null
              },
              (v4/*: any*/)
            ],
            "storageKey": null
          },
          (v5/*: any*/)
        ],
        "storageKey": "checkpoints(first:500,where:{\"createTimeGTE\":\"2020-01-01T00:00:00Z\"})"
      },
      {
        "alias": null,
        "args": (v7/*: any*/),
        "filters": (v6/*: any*/),
        "handle": "connection",
        "key": "netWorthChart_checkpoints",
        "kind": "LinkedHandle",
        "name": "checkpoints"
      }
    ]
  },
  "params": {
    "cacheID": "b04e67f1745ac3482c6a6ddf564da4ff",
    "id": null,
    "metadata": {},
    "name": "AccountsQuery",
    "operationKind": "query",
    "text": "query AccountsQuery {\n  ...accountsPanelFragment\n}\n\nfragment accountCardFragment on Account {\n  id\n  name\n  type\n  icon\n  updateTime\n  currency {\n    code\n    id\n  }\n  user {\n    name\n    id\n  }\n  value\n  balance\n}\n\nfragment accountsPanelFragment on Query {\n  accounts(first: 50, where: {archived: false}) {\n    edges {\n      node {\n        id\n        type\n        name\n        valueInHouseholdCurrency\n        ...accountCardFragment\n        __typename\n      }\n      cursor\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n  ...netWorthChartFragment\n}\n\nfragment netWorthChartFragment on Query {\n  checkpoints(first: 500, where: {createTimeGTE: \"2020-01-01T00:00:00Z\"}) {\n    edges {\n      node {\n        createTime\n        netWorth\n        id\n        __typename\n      }\n      cursor\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "4d6bf0d5c2b549059b7704d5b7f161ef";

export default node;
