import React from 'react';
import Layout from '@theme/Layout';
import VectorSearch from '@site/src/components/VectorSearch/VectorSearch';

export default function SearchPage(): JSX.Element {
  return (
    <Layout title="Search Documentation" description="Search through SmartWinnr documentation">
      <div className="container margin-vert--lg">
        <div className="row">
          <div className="col col--8 col--offset-2">
            <h1>Search Documentation</h1>
            <p>Use our AI-powered semantic search to find information across all SmartWinnr documentation.</p>
            <div style={{ marginTop: '2rem' }}>
              <VectorSearch placeholder="What would you like to know about SmartWinnr?" />
            </div>
            <div style={{ marginTop: '2rem', fontSize: '0.9rem', color: 'var(--ifm-color-emphasis-600)' }}>
              <p><strong>Search Tips:</strong></p>
              <ul>
                <li>Ask natural language questions like "How to create a quiz?"</li>
                <li>Search for specific features like "leaderboards" or "competitions"</li>
                <li>Use concepts like "gamification" or "microlearning"</li>
                <li>Results are ranked by semantic similarity, not just keyword matching</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}