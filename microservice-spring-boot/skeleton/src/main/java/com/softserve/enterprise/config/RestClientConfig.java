package com.softserve.enterprise.config;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.AbstractOAuth2Token;
import org.springframework.web.client.RestClient;

/**
 * Configures {@link RestClient} bean to handle <strong>JWT Token Propagation Client</strong> authentication scenario.
 *
 * <p>The <strong>JWT Token Propagation Client</strong> intercepts outgoing requests
 * and attaches the bearer token from the current security context if present.</p>
 */
@Configuration
public class RestClientConfig {

    /**
     * Qualifier for the token-propagating {@link RestClient}.
     */
    public static final String TOKEN_PROPAGATION_REST_CLIENT = "tokenPropagationRestClient";

    /**
     * Creates a primary {@link RestClient} that propagates the incoming bearer token downstream.
     *
     * @param builder a {@link RestClient.Builder} used to configure the client
     * @return a new {@link RestClient} that sets the bearer token on each outgoing request
     */
    @Bean
    @Primary
    @Qualifier(TOKEN_PROPAGATION_REST_CLIENT)
    public RestClient tokenPropagationRestClient(RestClient.Builder builder) {
        return builder.requestInterceptor((request, body, execution) -> {
                var authentication = SecurityContextHolder.getContext()
                    .getAuthentication();
                if (authentication == null) {
                    return execution.execute(request, body);
                }
                if (!(authentication.getCredentials() instanceof AbstractOAuth2Token token)) {
                    return execution.execute(request, body);
                }
                request.getHeaders()
                    .setBearerAuth(token.getTokenValue());
                return execution.execute(request, body);
            })
            .build();
    }
}