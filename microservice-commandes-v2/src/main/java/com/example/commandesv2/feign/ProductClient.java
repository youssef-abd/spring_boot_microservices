package com.example.commandesv2.feign;

import com.example.commandesv2.dto.ProductDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

// "microservice-produit" matches the spring.application.name of the product service in Eureka
@FeignClient(name = "MICROSERVICE-PRODUIT")
public interface ProductClient {
    
    @GetMapping("/produits/{id}")
    ProductDTO getProduitById(@PathVariable("id") Long id);
    
    // To test circuit breaker
    @GetMapping("/produits/slow")
    String slowCall();
}
