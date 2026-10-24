package com.negocio.inventario.service;

import com.negocio.inventario.entity.MovimientoInventario;
import com.negocio.inventario.entity.Producto;
import com.negocio.inventario.repository.MovimientoInventarioRepository;
import com.negocio.inventario.repository.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MovimientoService {

    @Autowired
    private MovimientoInventarioRepository movimientoRepository;

    @Autowired
    private ProductoRepository productoRepository;

    // Registrar una entrada
    public MovimientoInventario registrarEntrada(Long productoId, Integer cantidad, String motivo) {
        Producto producto = productoRepository.findById(productoId)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        MovimientoInventario movimiento = new MovimientoInventario();
        movimiento.setProducto(producto);
        movimiento.setTipoMovimiento("ENTRADA");
        movimiento.setCantidad(cantidad);
        movimiento.setStockAnterior(producto.getCantidad());
        movimiento.setStockNuevo(producto.getCantidad() + cantidad);
        movimiento.setMotivo(motivo);
        movimiento.setFecha(LocalDateTime.now());

        return movimientoRepository.save(movimiento);
    }

    // Registrar una salida
    public MovimientoInventario registrarSalida(Long productoId, Integer cantidad, String motivo) {
        Producto producto = productoRepository.findById(productoId)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        if (producto.getCantidad() < cantidad) {
            throw new RuntimeException("Stock insuficiente. Disponible: " + producto.getCantidad());
        }

        MovimientoInventario movimiento = new MovimientoInventario();
        movimiento.setProducto(producto);
        movimiento.setTipoMovimiento("SALIDA");
        movimiento.setCantidad(cantidad);
        movimiento.setStockAnterior(producto.getCantidad());
        movimiento.setStockNuevo(producto.getCantidad() - cantidad);
        movimiento.setMotivo(motivo);
        movimiento.setFecha(LocalDateTime.now());

        return movimientoRepository.save(movimiento);
    }

    // Listar todos los movimientos
    public List<MovimientoInventario> listarTodos() {
        return movimientoRepository.findAll();
    }

    // Listar movimientos de un producto
    public List<MovimientoInventario> listarPorProducto(Long productoId) {
        return movimientoRepository.findByProductoId(productoId);
    }
}