import React from 'react';
import {KeycloakClientCardContent} from './KeycloakClientCardContent';
import {Card, CardContent, CardHeader, Divider, styled} from "@mui/material";

const StyledCard = styled(Card)(({ theme }) => ({
  maxWidth: 750,
  minHeight: 750,
  marginBottom: theme.spacing(2),
  boxShadow: theme.shadows[1],
}));

export const KeycloakClientCard = () => {
  return (
    <StyledCard>
      <CardHeader title="Keyclok OAuth2 Client" />
      <Divider />
      <CardContent>
        <KeycloakClientCardContent />
      </CardContent>
    </StyledCard>
  );
};
