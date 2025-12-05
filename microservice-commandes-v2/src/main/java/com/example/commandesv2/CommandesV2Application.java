package com.example.commandesv2;

import com.example.commandesv2.domain.Commande;
import com.example.commandesv2.repository.CommandeRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.context.annotation.Bean;
import java.time.LocalDate;

@SpringBootApplication
@EnableFeignClients
public class CommandesV2Application {
    public static void main(String[] args) {
        SpringApplication.run(CommandesV2Application.class, args);
    }

    @Bean
    CommandLineRunner start(CommandeRepository repo) {
        return args -> {
            repo.save(new Commande(null, "Achat Laptop", 1, LocalDate.now(), 1200.0, 1L)); // Product 1
            repo.save(new Commande(null, "Achat Tel", 2, LocalDate.now().minusDays(2), 1600.0, 2L)); // Product 2
        };
    }
}
