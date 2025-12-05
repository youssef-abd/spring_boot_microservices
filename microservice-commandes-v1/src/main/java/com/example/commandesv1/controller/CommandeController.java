package com.example.commandesv1.controller;

import com.example.commandesv1.config.CommandesConfig;
import com.example.commandesv1.domain.Commande;
import com.example.commandesv1.repository.CommandeRepository;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/commandes")
public class CommandeController {

    private final CommandeRepository repository;
    private final CommandesConfig config;
    private final org.springframework.core.env.Environment environment;

    public CommandeController(CommandeRepository repository, CommandesConfig config, org.springframework.core.env.Environment environment) {
        this.repository = repository;
        this.config = config;
        this.environment = environment;
    }

    @GetMapping
    public List<Commande> getAll() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public Commande getById(@PathVariable Long id) {
        return repository.findById(id).orElseThrow(() -> new RuntimeException("Commande not found"));
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

    @GetMapping("/info")
    public String getInfo() {
        String port = environment.getProperty("local.server.port");
        return "Microservice Commandes V1 running on port: " + port;
    }

    @GetMapping("/recent")
    public List<Commande> getRecentCommandes() {
        int days = config.getCommandesLast();
        LocalDate cutoffDate = LocalDate.now().minusDays(days);
        return repository.findByDateAfter(cutoffDate);
    }
}
