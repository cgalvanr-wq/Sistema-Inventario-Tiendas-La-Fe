package com.negocio.inventario.repository;

import com.negocio.inventario.entity.Venta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface VentaRepository extends JpaRepository<Venta, Long> {
    List<Venta> findByNumeroFactura(String numeroFactura);
}