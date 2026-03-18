package com.softserve.enterprise.config;

import org.springframework.boot.autoconfigure.AutoConfigureAfter;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration class for creating and wiring up your REST client API beans.
 *
 * <p>Example usage:
 * <pre>{@code
 * @Bean
 * public ClientApi jwtPropagationClientApi(
 *         @Qualifier(RestClientConfig.TOKEN_PROPAGATION_REST_CLIENT) RestClient restClient) {
 *     return new ClientApi(new ApiClient(restClient));
 * }
 *
 * @Bean
 * public ClientApi clientCredentialsClientApi(
 *         @Lazy @Qualifier("googleRestClient") RestClient restClient) {
 *     return new ClientApi(new ApiClient(restClient));
 * }
 * }</pre>
 *
 * <p>Explanation:
 * <ul>
 *     <li><strong>JWT Token Propagation</strong>: uses the incoming request's token
 *         to propagate downstream.</li>
 *     <li><strong>OAuth2 Client Credentials</strong>: uses a configured OAuth2 client
 *         to acquire a token automatically.</li>
 * </ul>
 */
@Configuration
@AutoConfigureAfter(RestClientConfig.class)
public class ClientApiConfig {

}