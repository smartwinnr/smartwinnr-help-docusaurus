#!/usr/bin/env node
const axios = require('axios');
require('dotenv').config();

async function testHelpScoutAPI() {
  const apiKey = process.env.HELPSCOUT_API_KEY;
  const baseUrl = 'https://docsapi.helpscout.net/v1';
  
  if (!apiKey) {
    console.error('HELPSCOUT_API_KEY not found in environment variables');
    return;
  }
  
  console.log('Testing HelpScout API...');
  
  try {
    // Test 1: Get collections
    console.log('\n1. Testing collections endpoint...');
    const collectionsResponse = await axios.get(`${baseUrl}/collections`, {
      auth: {
        username: apiKey,
        password: 'X'
      }
    });
    
    console.log(`✓ Found ${collectionsResponse.data.collections?.items?.length || 0} collections`);
    if (collectionsResponse.data.collections?.items?.length > 0) {
      const firstCollection = collectionsResponse.data.collections.items[0];
      console.log(`  - First collection: ${firstCollection.name} (ID: ${firstCollection.id})`);
      
      // Test 2: Get articles from first collection
      console.log('\n2. Testing articles from collection...');
      const articlesResponse = await axios.get(`${baseUrl}/collections/${firstCollection.id}/articles`, {
        auth: {
          username: apiKey,
          password: 'X'
        },
        params: {
          status: 'all',
          pageSize: 3
        }
      });
      
      console.log(`✓ Found ${articlesResponse.data.articles?.items?.length || 0} articles in collection`);
      if (articlesResponse.data.articles?.items?.length > 0) {
        const firstArticle = articlesResponse.data.articles.items[0];
        console.log(`  - First article: ${firstArticle.name} (ID: ${firstArticle.id})`);
        
        // Test 3: Get specific article details
        console.log('\n3. Testing specific article details...');
        const articleResponse = await axios.get(`${baseUrl}/articles/${firstArticle.id}`, {
          auth: {
            username: apiKey,
            password: 'X'
          }
        });
        
        console.log(`✓ Article details retrieved:`);
        console.log(`  - Title: ${articleResponse.data.article?.name}`);
        console.log(`  - Status: ${articleResponse.data.article?.status}`);
        console.log(`  - Has content: ${articleResponse.data.article?.text ? 'Yes' : 'No'}`);
        console.log(`  - Content length: ${articleResponse.data.article?.text?.length || 0} characters`);
      }
    }
    
    console.log('\n🎉 All API tests passed!');
    
  } catch (error) {
    console.error('\n💥 API test failed:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url
    });
  }
}

testHelpScoutAPI();