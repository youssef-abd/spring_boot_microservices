package com.example.commandesv1;

import com.example.commandesv1.domain.Commande;
import com.example.commandesv1.repository.CommandeRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import java.time.LocalDate;

@SpringBootApplication
public class CommandesV1Application {
    public static void main(String[] args) {
        SpringApplication.run(CommandesV1Application.class, args);
    }
    
    @Bean
    CommandLineRunner start(CommandeRepository repo) {
        return args -> {
            repo.save(new Commande(null, "Commande Initial 1", 2, LocalDate.now(), 100.0));
            repo.save(new Commande(null, "Commande Initial 2", 1, LocalDate.now().minusDays(5), 50.0));
            repo.save(new Commande(null, "Commande Old", 1, LocalDate.now().minusDays(20), 20.0));
        };
    }
}
