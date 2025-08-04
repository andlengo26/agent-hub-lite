/**
 * Test for IntegrationsTab to verify refactoring didn't break functionality
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { IntegrationsTab } from '../IntegrationsTab';

const mockSettings = {
  integrations: {
    apiKey: 'test-key',
    aiModel: 'gpt-4',
    moodle: {
      moodleUrl: 'https://test-moodle.com',
      apiToken: 'test-token',
      enabled: true,
      autoLogin: false,
      requiredFields: { studentId: false, department: false }
    }
  }
} as any;

const mockUpdateSettings = jest.fn();

describe('IntegrationsTab', () => {
  it('renders integration settings correctly', () => {
    render(
      <IntegrationsTab 
        settings={mockSettings} 
        updateSettings={mockUpdateSettings} 
      />
    );

    expect(screen.getByLabelText(/API Key/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/AI Model/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Moodle URL/i)).toBeInTheDocument();
  });
});