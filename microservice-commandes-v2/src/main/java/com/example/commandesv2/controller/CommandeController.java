package com.example.commandesv2.controller;

import com.example.commandesv2.domain.Commande;
import com.example.commandesv2.dto.CommandeResponseDTO;
import com.example.commandesv2.dto.ProductDTO;
import com.example.commandesv2.feign.ProductClient;
import com.example.commandesv2.repository.CommandeRepository;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.timelimiter.annotation.TimeLimiter;
import org.springframework.web.bind.annotation.*;

import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/commandes-v2")
public class CommandeController {

    private final CommandeRepository repository;
    private final ProductClient productClient;

    public CommandeController(CommandeRepository repository, ProductClient productClient) {
        this.repository = repository;
        this.productClient = productClient;
    }

    @GetMapping("/{id}")
    @CircuitBreaker(name = "produitService", fallbackMethod = "fallbackGetCommande")
    public CommandeResponseDTO getCommandeWithProduct(@PathVariable Long id) {
        Commande commande = repository.findById(id).orElseThrow();
        // Call Product Service via Feign
        ProductDTO product = productClient.getProduitById(commande.getIdProduit());
        return new CommandeResponseDTO(commande, product);
    }
    
    // Fallback method
    public CommandeResponseDTO fallbackGetCommande(Long id, Throwable t) {
        Commande commande = repository.findById(id).orElseThrow();
        ProductDTO fallbackProduct = new ProductDTO();
        fallbackProduct.setNom("Produit non disponible (Fallback)");
        fallbackProduct.setPrix(0.0);
        return new CommandeResponseDTO(commande, fallbackProduct);
    }
}
