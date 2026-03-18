'use strict';

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, QueryCommand } = require('@aws-sdk/lib-dynamodb');
const config = require('./config');

let docClient = null;

function getClient() {
  if (!docClient) {
    const ddbClient = new DynamoDBClient({ region: config.awsRegion });
    docClient = DynamoDBDocumentClient.from(ddbClient);
  }
  return docClient;
}

/**
 * Look up a user's region info from the UserRegionMapping DynamoDB table.
 * Returns { baseUrl, tenantId } or null if not found.
 */
async function lookupUserRegion(email) {
  const client = getClient();

  const command = new QueryCommand({
    TableName: 'UserRegionMapping',
    KeyConditionExpression: 'user_identifier = :email',
    ExpressionAttributeValues: {
      ':email': email.toLowerCase(),
    },
    Limit: 1,
  });

  const result = await client.send(command);

  if (!result.Items || result.Items.length === 0) {
    return null;
  }

  const item = result.Items[0];
  // The primary app uses `base_URL` (capital URL) but handle both
  const baseUrl = item.base_URL || item.base_url || null;
  const tenantId = item.tenant_id || item.tenantId || null;

  if (!baseUrl) {
    return null;
  }

  return { baseUrl, tenantId };
}

module.exports = { lookupUserRegion };
