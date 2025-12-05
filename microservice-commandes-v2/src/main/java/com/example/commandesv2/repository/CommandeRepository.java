package com.example.commandesv2.repository;

import com.example.commandesv2.domain.Commande;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommandeRepository extends JpaRepository<Commande, Long> {
}
