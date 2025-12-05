package com.example.commandesv1.health;

import com.example.commandesv1.repository.CommandeRepository;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;

@Component
public class CommandeHealthIndicator implements HealthIndicator {

    private final CommandeRepository repository;

    public CommandeHealthIndicator(CommandeRepository repository) {
        this.repository = repository;
    }

    @Override
    public Health health() {
        long count = repository.count();
        if (count > 0) {
            return Health.up().withDetail("message", "Tables commandes non vide").withDetail("count", count).build();
        } else {
            return Health.down().withDetail("message", "Table commandes vide").build();
        }
    }
}
