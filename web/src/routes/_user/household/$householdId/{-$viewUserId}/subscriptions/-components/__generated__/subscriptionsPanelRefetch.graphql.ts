/**
 * @generated SignedSource<<6a0db5c72946780b3a09c47966f3a591>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type subscriptionsPanelRefetch$variables = {
  count?: number | null | undefined;
  cursor?: any | null | undefined;
  id: string;
  viewUserId?: string | null | undefined;
};
export type subscriptionsPanelRefetch$data = {
  readonly node: {
    readonly " $fragmentSpreads": FragmentRefs<"subscriptionsPanelFragment">;
  } | null | undefined;
};
export type subscriptionsPanelRefetch = {
  response: subscriptionsPanelRefetch$data;
  variables: subscriptionsPanelRefetch$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": 50,
  "kind": "LocalArgument",
  "name": "count"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "cursor"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "id"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "viewUserId"
},
v4 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
  }
],
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v7 = [
  {
    "kind": "Variable",
    "name": "after",
    "variableName": "cursor"
  },
  {
    "kind": "Variable",
    "name": "first",
    "variableName": "count"
  },
  {
    "fields": [
      {
        "kind": "Variable",
        "name": "userID",
        "variableName": "viewUserId"
      }
    ],
    "kind": "ObjectValue",
    "name": "where"
  }
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "subscriptionsPanelRefetch",
    "selections": [
      {
        "alias": null,
        "args": (v4/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "args": [
              {
                "kind": "Variable",
                "name": "count",
                "variableName": "count"
              },
              {
                "kind": "Variable",
                "name": "cursor",
                "variableName": "cursor"
              },
              {
                "kind": "Variable",
                "name": "viewUserId",
                "variableName": "viewUserId"
              }
            ],
            "kind": "FragmentSpread",
            "name": "subscriptionsPanelFragment"
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
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v3/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Operation",
    "name": "subscriptionsPanelRefetch",
    "selections": [
      {
        "alias": null,
        "args": (v4/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v5/*: any*/),
          (v6/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "alias": null,
                "args": (v7/*: any*/),
                "concreteType": "RecurringSubscriptionConnection",
                "kind": "LinkedField",
                "name": "recurringSubscriptions",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "RecurringSubscriptionEdge",
                    "kind": "LinkedField",
                    "name": "edges",
                    "plural": true,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "RecurringSubscription",
                        "kind": "LinkedField",
                        "name": "node",
                        "plural": false,
                        "selections": [
                          (v6/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "active",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "cost",
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
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "code",
                                "storageKey": null
                              },
                              (v6/*: any*/)
                            ],
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "interval",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "intervalCount",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "startDate",
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
                            "name": "icon",
                            "storageKey": null
                          },
                          (v5/*: any*/)
                        ],
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "cursor",
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  },
                  {
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
                  {
                    "kind": "ClientExtension",
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "__id",
                        "storageKey": null
                      }
                    ]
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": (v7/*: any*/),
                "filters": [
                  "where"
                ],
                "handle": "connection",
                "key": "subscriptionsPanel_recurringSubscriptions",
                "kind": "LinkedHandle",
                "name": "recurringSubscriptions"
              }
            ],
            "type": "Household",
            "abstractKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "8f912b3f9cf3728dbfc413ce7c1616e3",
    "id": null,
    "metadata": {},
    "name": "subscriptionsPanelRefetch",
    "operationKind": "query",
    "text": "query subscriptionsPanelRefetch(\n  $count: Int = 50\n  $cursor: Cursor\n  $viewUserId: ID\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...subscriptionsPanelFragment_q4eSF\n    id\n  }\n}\n\nfragment subscriptionCardFragment on RecurringSubscription {\n  id\n  name\n  icon\n  cost\n  interval\n  intervalCount\n  startDate\n  householdCurrency {\n    code\n    id\n  }\n}\n\nfragment subscriptionsPanelFragment_q4eSF on Household {\n  recurringSubscriptions(first: $count, after: $cursor, where: {userID: $viewUserId}) {\n    edges {\n      node {\n        id\n        active\n        cost\n        householdCurrency {\n          code\n          id\n        }\n        interval\n        intervalCount\n        startDate\n        name\n        ...subscriptionCardFragment\n        __typename\n      }\n      cursor\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n  id\n}\n"
  }
};
})();

(node as any).hash = "73d0b8dd833db5e8d85d998db19f38e7";

export default node;
