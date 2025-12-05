package com.example.commandesv2.dto;

import com.example.commandesv2.domain.Commande;
import lombok.Data;
import java.time.LocalDate;

@Data
public class CommandeResponseDTO {
    private Long id;
    private String description;
    private LocalDate date;
    private ProductDTO produit;
    
    public CommandeResponseDTO(Commande c, ProductDTO p) {
        this.id = c.getId();
        this.description = c.getDescription();
        this.date = c.getDate();
        this.produit = p;
    }
}
