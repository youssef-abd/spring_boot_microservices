package com.example.produit;

import com.example.produit.domain.Produit;
import com.example.produit.repository.ProduitRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class ProduitApplication {
    public static void main(String[] args) {
        SpringApplication.run(ProduitApplication.class, args);
    }

    @Bean
    CommandLineRunner start(ProduitRepository repo) {
        return args -> {
            repo.save(new Produit(null, "Laptop Dell", 1200.0));
            repo.save(new Produit(null, "Smartphone Samsung", 800.0));
            repo.save(new Produit(null, "Ecran 4K", 300.0));
        };
    }
}
