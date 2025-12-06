package com.example.produit.controller;

import com.example.produit.domain.Produit;
import com.example.produit.repository.ProduitRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/produits")
public class ProduitController {

    private final ProduitRepository repository;

    public ProduitController(ProduitRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Produit> getAll() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public Produit getById(@PathVariable("id") Long id) {
        System.out.println("=== GET BY ID CALLED: " + id);
        Optional<Produit> produit = repository.findById(id);
        System.out.println("=== FOUND: " + produit.isPresent());
        if (produit.isPresent()) {
            System.out.println("=== PRODUIT: " + produit.get().getNom());
            return produit.get();
        }
        throw new RuntimeException("Produit non trouvé: " + id);
    }
    
    @GetMapping("/test/{id}")
    public String test(@PathVariable("id") Long id) {
        return "Test OK pour ID: " + id;
    }
    
    // Endpoint pour simuler un timeout
    @GetMapping("/slow")
    public String slowEndpoint() throws InterruptedException {
        Thread.sleep(3000); // 3 seconds delay
        return "Réponse après délai";
    }

    @PostMapping
    public Produit create(@RequestBody Produit produit) {
        return repository.save(produit);
    }
}
