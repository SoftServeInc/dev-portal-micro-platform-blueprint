package com.softserve.enterprise.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

/**
 * Configures security for the application, enabling an OAuth2 resource server
 * that expects JWT tokens and method-level security.
 *
 * <p>By default, all endpoints are authenticated and incoming requests must
 * provide a valid JWT token. Adjust the security rules as needed.</p>
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@EnableConfigurationProperties(CorsProperties.class)
class OAuthSecurityFilterChainConfig {

    /**
     * Defines the filter chain used by Spring Security to handle JWT token
     * authentication and authorization rules.
     *
     * @param http the {@link HttpSecurity} to modify
     * @return a built {@link SecurityFilterChain}
     * @throws Exception if any security configuration fails
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.authorizeHttpRequests(auth -> auth.anyRequest()
                        .authenticated())
                .oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()))
                .cors(Customizer.withDefaults());
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource(CorsProperties corsProps) {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(corsProps.getAllowedOrigins());
        config.setAllowedMethods(corsProps.getAllowedMethods());
        config.setAllowedHeaders(corsProps.getAllowedHeaders());
        config.setAllowCredentials(corsProps.isAllowCredentials());

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}