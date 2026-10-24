package com.negocio.inventario.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "venta")
public class Venta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ✅ Campos nuevos para facturación formal
    @Column(name = "numero_factura", length = 30)
    private String numeroFactura;

    @ManyToOne
    @JoinColumn(name = "cliente_id")
    private Cliente cliente;

    @Column(name = "metodo_pago", length = 20)
    private String metodoPago;

    @Column(name = "direccion_pedido", length = 150)
    private String direccionPedido;

    @Column(length = 100)
    private String vendedor;

    private Double subtotal;
    private Double iva;

    // Campos existentes
    private Integer cantidad;
    private String tipoVenta;
    private Double total;
    private Double ganancia;
    private LocalDate fecha;

    @ManyToOne
    @JoinColumn(name = "producto_id")
    private Producto producto;

    public Venta() {
        this.fecha = LocalDate.now();
    }

    // ✅ Getters y Setters

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNumeroFactura() { return numeroFactura; }
    public void setNumeroFactura(String numeroFactura) { this.numeroFactura = numeroFactura; }

    public Cliente getCliente() { return cliente; }
    public void setCliente(Cliente cliente) { this.cliente = cliente; }

    public String getMetodoPago() { return metodoPago; }
    public void setMetodoPago(String metodoPago) { this.metodoPago = metodoPago; }

    public String getDireccionPedido() { return direccionPedido; }
    public void setDireccionPedido(String direccionPedido) { this.direccionPedido = direccionPedido; }

    public String getVendedor() { return vendedor; }
    public void setVendedor(String vendedor) { this.vendedor = vendedor; }

    public Double getSubtotal() { return subtotal; }
    public void setSubtotal(Double subtotal) { this.subtotal = subtotal; }

    public Double getIva() { return iva; }
    public void setIva(Double iva) { this.iva = iva; }

    public Integer getCantidad() { return cantidad; }
    public void setCantidad(Integer cantidad) { this.cantidad = cantidad; }

    public String getTipoVenta() { return tipoVenta; }
    public void setTipoVenta(String tipoVenta) { this.tipoVenta = tipoVenta; }

    public Double getTotal() { return total; }
    public void setTotal(Double total) { this.total = total; }

    public Double getGanancia() { return ganancia; }
    public void setGanancia(Double ganancia) { this.ganancia = ganancia; }

    public LocalDate getFecha() { return fecha; }
    public void setFecha(LocalDate fecha) { this.fecha = fecha; }

    public Producto getProducto() { return producto; }
    public void setProducto(Producto producto) { this.producto = producto; }
}