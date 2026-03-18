package com.softserve.enterprise.config;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.config.ConfigurableListableBeanFactory;
import org.springframework.boot.security.oauth2.client.autoconfigure.ConditionalOnOAuth2ClientRegistrationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientManager;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.client.OAuth2ClientHttpRequestInterceptor;
import org.springframework.web.client.RestClient;

/**
 * Configures multiple {@link RestClient} beans to handle <strong>OAuth2 Client Credentials Client</strong>
 * authentication scenario.
 *
 * <p>The <strong>OAuth2 Client Credentials Client</strong> is created dynamically
 * for each client registration found in the {@link ClientRegistrationRepository}.
 * Each bean is registered with a name of the form <code>registrationId + "RestClient"</code>.</p>
 */
@Configuration
@ConditionalOnOAuth2ClientRegistrationProperties
public class DynamicRestClientConfig {

    /**
     * Common suffix added to dynamically registered OAuth2 client beans.
     */
    public static final String REST_CLIENT_QUALIFIER_SUFFIX = "RestClient";

    @Autowired
    private ConfigurableListableBeanFactory beanFactory;
    @Autowired
    private ClientRegistrationRepository clientRegistrationRepository;
    @Autowired
    private OAuth2AuthorizedClientManager authorizedClientManager;

    /**
     * Registers a {@link RestClient} for every client registration in the
     * {@link ClientRegistrationRepository}, setting up an interceptor that
     * uses the client_credentials flow to obtain tokens automatically.
     */
    @PostConstruct
    public void registerClientCredentialsRestClients() {
        if (clientRegistrationRepository instanceof Iterable<?> iterable) {
            iterable.forEach(client -> {
                if (client instanceof ClientRegistration clientRegistration) {
                    var registrationId = clientRegistration.getRegistrationId();

                    var requestInterceptor = new OAuth2ClientHttpRequestInterceptor(authorizedClientManager);
                    requestInterceptor.setClientRegistrationIdResolver(request -> registrationId);

                    var restClient = RestClient.builder()
                        .requestInterceptor(requestInterceptor)
                        .build();
                    beanFactory.registerSingleton(registrationId + REST_CLIENT_QUALIFIER_SUFFIX, restClient);
                }
            });
        }
    }
}
