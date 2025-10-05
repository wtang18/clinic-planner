import React from 'react';
import { Button } from './button';

export default {
  title: 'UI/Button',
  component: Button,
};

export const Default = () => (
  <div className="p-8 space-y-4">
    <Button>Default Button</Button>
    <Button variant="secondary">Secondary Button</Button>
    <Button variant="outline">Outline Button</Button>
    <Button variant="ghost">Ghost Button</Button>
  </div>
);
