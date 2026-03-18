package com.softserve.enterprise.config;

import org.springframework.boot.security.oauth2.client.autoconfigure.ConditionalOnOAuth2ClientRegistrationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.client.AuthorizedClientServiceOAuth2AuthorizedClientManager;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientManager;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientProviderBuilder;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;

/**
 * Configures the {@link OAuth2AuthorizedClientManager} responsible for managing OAuth2 clients
 * using the client_credentials grant type.
 *
 * <p>This class loads an {@link OAuth2AuthorizedClientService}, as well as a
 * {@link ClientRegistrationRepository}, and builds an {@link OAuth2AuthorizedClientManager}
 * that knows how to fetch tokens using the client_credentials flow.</p>
 */
@Configuration
@ConditionalOnOAuth2ClientRegistrationProperties
public class OAuth2ClientConfig {

    /**
     * Creates an {@link OAuth2AuthorizedClientManager} to handle authorization for OAuth2 client
     * credentials flow.
     *
     * @param oauth2AuthorizedClientService the service that tracks authorized clients
     * @param clientRegistrationRepository  the repository of client registration details
     * @return an {@link OAuth2AuthorizedClientManager} set up for client_credentials
     */
    @Bean
    public OAuth2AuthorizedClientManager authorizedClientManager(
        OAuth2AuthorizedClientService oauth2AuthorizedClientService,
        ClientRegistrationRepository clientRegistrationRepository) {
        var authorizedClientProvider = OAuth2AuthorizedClientProviderBuilder.builder()
            .clientCredentials()
            .build();
        var authorizedClientManager = new AuthorizedClientServiceOAuth2AuthorizedClientManager(
            clientRegistrationRepository, oauth2AuthorizedClientService);
        authorizedClientManager.setAuthorizedClientProvider(authorizedClientProvider);
        return authorizedClientManager;
    }
}