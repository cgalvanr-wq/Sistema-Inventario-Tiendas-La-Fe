package com.negocio.inventario.repository;

import com.negocio.inventario.entity.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Long> {
    Cliente findByCedula(String cedula);

    // ✅ Para el buscador (ignora mayúsculas/minúsculas)
    List<Cliente> findByCedulaContainingIgnoreCaseOrNombreContainingIgnoreCase(String cedula, String nombre);
}