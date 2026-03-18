import React from 'react';
import {Page, Header, Content} from '@backstage/core-components';
import {TokenGeneratorPageContent} from './TokenGeneratorPageContent';

export const TokenGeneratorPage = () => {
  return (
    <Page themeId="tool">
      <Header title="OAuth API Token Generator" subtitle="PKCE Flow"/>
      <Content>
        <TokenGeneratorPageContent/>
      </Content>
    </Page>
  );
};
