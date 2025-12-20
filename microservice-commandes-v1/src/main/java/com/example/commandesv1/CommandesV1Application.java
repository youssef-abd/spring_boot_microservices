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
    
    // Pas de données initiales
}
