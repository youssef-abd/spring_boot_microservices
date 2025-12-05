package com.example.commandesv1.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.stereotype.Component;
import lombok.Data;

@Component
@ConfigurationProperties(prefix = "mes-config-ms")
@RefreshScope
@Data
public class CommandesConfig {
    private int commandesLast = 7; // Default value
}
