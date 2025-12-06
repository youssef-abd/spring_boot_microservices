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

    @GetMapping
    public java.util.List<Commande> getAll() {
        return repository.findAll();
    }

    @PostMapping
    public Commande create(@RequestBody Commande commande) {
        return repository.save(commande);
    }

    @PutMapping("/{id}")
    public Commande update(@PathVariable Long id, @RequestBody Commande commande) {
        commande.setId(id);
        return repository.save(commande);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        repository.deleteById(id);
    }

    @GetMapping("/{id}")
    @io.swagger.v3.oas.annotations.Operation(summary = "Get Commande by ID")
    @CircuitBreaker(name = "produitService", fallbackMethod = "fallbackGetCommande")
    public CommandeResponseDTO getCommandeWithProduct(
            @io.swagger.v3.oas.annotations.Parameter(description = "ID of the commande", required = true)
            @PathVariable("id") Long id) {
        Commande commande = repository.findById(id)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "Commande non trouvée"));
        // Call Product Service via Feign
        ProductDTO product = productClient.getProduitById(commande.getIdProduit());
        return new CommandeResponseDTO(commande, product);
    }
    
    // Fallback method
    public CommandeResponseDTO fallbackGetCommande(Long id, Throwable t) {
        Commande commande = repository.findById(id)
                 .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "Commande non trouvée (Fallback)"));
        ProductDTO fallbackProduct = new ProductDTO();
        // DEBUG: Show the real error in the name
        fallbackProduct.setNom("Fallback (Erreur: " + t.getMessage() + ")");
        fallbackProduct.setPrix(0.0);
        return new CommandeResponseDTO(commande, fallbackProduct);
    }
}
