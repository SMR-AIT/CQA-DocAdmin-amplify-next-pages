import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth_/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';
import { buildVDB } from './functions/buildVDB/resource';
// import { aws_events } from "aws-cdk-lib";
// import {
//   Effect,
//   PolicyDocument,
//   PolicyStatement,
//   Role,
//   ServicePrincipal,
// } from "aws-cdk-lib/aws-iam";


export const backend = defineBackend({
  auth,
  data,
  storage,
  buildVDB,
});

// // Create a new stack for the EventBridge data source
// const eventStack = backend.createStack("MyExternalDataSources");

// // Reference or create an EventBridge EventBus
// const eventBus = aws_events.EventBus.fromEventBusName(
//   eventStack,   //parent constructor
//   "MyEventBus", //construct ID
//   "default"     //eventBusName
// );

// // Add the EventBridge data source
// backend.data.addEventBridgeDataSource("EventBridgeDataSource", eventBus);

// // Create a policy statement to allow invoking the AppSync API's mutations
// const policyStatement = new PolicyStatement({
//   effect: Effect.ALLOW,
//   actions: ["appsync:GraphQL"],
//   resources: [`${backend.data.resources.graphqlApi.arn}/types/Mutation/*`],
// });

// // Create a role for the EventBus to assume
// const eventBusRole = new Role(eventStack, "AppSyncInvokeRole", {
//   assumedBy: new ServicePrincipal("events.amazonaws.com"),
//   inlinePolicies: {
//     PolicyStatement: new PolicyDocument({
//       statements: [policyStatement],
//     }),
//   },
// });

// // Create an EventBridge rule to route events to the AppSync API
// const rule = new aws_events.CfnRule(eventStack, "MyOrderRule", {
//   eventBusName: eventBus.eventBusName,
//   name: "broadcastOrderStatusChange",
//   eventPattern: {
//     source: ["amplify.orders"],
//     /* The shape of the event pattern must match EventBridge's event message structure.
//     So, this field must be spelled as "detail-type". Otherwise, events will not trigger the rule.

//     https://docs.aws.amazon.com/AmazonS3/latest/userguide/ev-events.html
//     */
//     ["detail-type"]: ["OrderStatusChange"],
//     detail: {
//       orderId: [{ exists: true }],
//       status: ["PENDING", "SHIPPED", "DELIVERED"],
//       message: [{ exists: true }],
//     },
//   },
//   targets: [
//     {
//       id: "orderStatusChangeReceiver",
//       arn: backend.data.resources.cfnResources.cfnGraphqlApi
//         .attrGraphQlEndpointArn,
//       roleArn: eventBusRole.roleArn,
//       appSyncParameters: {
//         graphQlOperation: `
//         mutation PublishOrderFromEventBridge(
//           $orderId: String!
//           $status: String!
//           $message: String!
//         ) {
//           publishOrderFromEventBridge(orderId: $orderId, status: $status, message: $message) {
//             orderId
//             status
//             message
//           }
//         }`,
//       },
//       inputTransformer: {
//         inputPathsMap: {
//           orderId: "$.detail.orderId",
//           status: "$.detail.status",
//           message: "$.detail.message",
//         },
//         inputTemplate: JSON.stringify({
//           orderId: "<orderId>",
//           status: "<status>",
//           message: "<message>",
//         }),
//       },
//     },
//   ],
// });
