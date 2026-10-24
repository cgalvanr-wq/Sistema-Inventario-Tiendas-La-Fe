package com.negocio.inventario.service;

import com.negocio.inventario.entity.Producto;
import com.negocio.inventario.repository.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;

@Service
public class ProductoService {

    @Autowired
    private ProductoRepository productoRepository;

    public List<Producto> listarTodos() {
        return productoRepository.findAll();
    }

    public Producto guardar(Producto producto) {
        // Calcular precio base (costo por unidad)
        double costoPorUnidad = producto.getPrecioCompra() / producto.getCantidad();
        producto.setPrecioBase(costoPorUnidad);

        // Calcular precios de venta
        producto.setPrecioDetal(costoPorUnidad * 1.30);
        producto.setPrecioMayor(costoPorUnidad * 1.15);

        // Calcular ganancia
        producto.setGanancia(producto.getPrecioDetal() - costoPorUnidad);

        // Fecha de registro
        producto.setFechaRegistro(LocalDate.now());

        return productoRepository.save(producto);
    }

    // ✅ ACTUALIZAR PRODUCTO
    public Producto actualizar(Long id, Producto datos) {
        Producto existente = productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        existente.setNombre(datos.getNombre());
        existente.setCantidad(datos.getCantidad());
        existente.setPrecioCompra(datos.getPrecioCompra());

        if (datos.getCategoria() != null) {
            existente.setCategoria(datos.getCategoria());
        }
        if (datos.getProveedor() != null && datos.getProveedor().getId() != null) {
            existente.setProveedor(datos.getProveedor());
        }

        // Recalcular precios
        double costoPorUnidad = datos.getPrecioCompra() / datos.getCantidad();
        existente.setPrecioBase(costoPorUnidad);
        existente.setPrecioDetal(costoPorUnidad * 1.30);
        existente.setPrecioMayor(costoPorUnidad * 1.15);
        existente.setGanancia(existente.getPrecioDetal() - costoPorUnidad);

        return productoRepository.save(existente);
    }

    public Producto buscarPorId(Long id) {
        return productoRepository.findById(id).orElse(null);
    }

    public void eliminar(Long id) {
        productoRepository.deleteById(id);
    }
}