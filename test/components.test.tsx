// test/components.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { expect } from 'chai';
import { MemoryRouter } from 'react-router-dom';

import Card from '../src/components/ui/Card';

describe('Card Component', () => {
  it('renders title and children', () => {
    render(
        <Card title="Test Title">
            <div>Test Children</div>
        </Card>
    );

    expect(screen.getByText('Test Title')).to.exist;
    expect(screen.getByText('Test Children')).to.exist;
  });

    it('renders an action link when actionHref is provided', () => {
        render(
            <MemoryRouter>
                <Card title="Test Title" actionLabel="Click me" actionHref="/test">
                    <div>Test Children</div>
                </Card>
            </MemoryRouter>
        );

        const link = screen.getByText('Click me');
        expect(link).to.exist;
        expect(link.closest('a')).to.have.property('href', 'http://localhost/test');
    });
});
