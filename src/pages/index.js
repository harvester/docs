import React from 'react';
import {Redirect} from '@docusaurus/router';

export default function Home(context) {
  return <Redirect to={`${context.config.baseUrl}v1.3`} />;
}