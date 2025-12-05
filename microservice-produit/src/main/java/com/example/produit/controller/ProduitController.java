package com.example.produit.controller;

import com.example.produit.domain.Produit;
import com.example.produit.repository.ProduitRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;

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
    public Produit getById(@PathVariable Long id) {
        return repository.findById(id).orElseThrow(() -> new RuntimeException("Product not found"));
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
