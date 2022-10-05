package com.choicify.backend.pusher;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class PusherConfig {
    @Value("${pusher.appId}")
    private String appId;
    @Value("${pusher.key}")
    private String key;
    @Value("${pusher.secret}")
    private String secret;

    @Bean
    public PusherInstance getPusher() {
        return new PusherInstance(appId, key, secret);
    }

}
