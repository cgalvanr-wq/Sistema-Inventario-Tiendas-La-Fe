package com.negocio.inventario.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "producto")
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;
    private Integer cantidad;
    private Double precioCompra;
    private Double precioBase;
    private Double precioDetal;
    private Double precioMayor;
    private Double ganancia;
    private LocalDate fechaRegistro;
    private LocalDate fechaVencimiento;

    // ✅ CAMPOS NUEVOS - PRECIOS SUGERIDOS
    @Column(name = "precio_sugerido")
    private Double precioSugerido;

    @Column(name = "precio_minimo")
    private Double precioMinimo;

    @Column(name = "motivo_sugerido")
    private String motivoSugerido;

    @Column(name = "oferta_activa")
    private Boolean ofertaActiva = false;

    // ✅ CAMPO NUEVO - SUBCATEGORÍA
    @Column(length = 50)
    private String subcategoria;

    @ManyToOne
    @JoinColumn(name = "categoria_id")
    private Categoria categoria;

    @ManyToOne
    @JoinColumn(name = "proveedor_id")
    private Proveedor proveedor;

    public Producto() {
        this.fechaRegistro = LocalDate.now();
    }

    // GETTERS Y SETTERS
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public Integer getCantidad() { return cantidad; }
    public void setCantidad(Integer cantidad) { this.cantidad = cantidad; }

    public Double getPrecioCompra() { return precioCompra; }
    public void setPrecioCompra(Double precioCompra) { this.precioCompra = precioCompra; }

    public Double getPrecioBase() { return precioBase; }
    public void setPrecioBase(Double precioBase) { this.precioBase = precioBase; }

    public Double getPrecioDetal() { return precioDetal; }
    public void setPrecioDetal(Double precioDetal) { this.precioDetal = precioDetal; }

    public Double getPrecioMayor() { return precioMayor; }
    public void setPrecioMayor(Double precioMayor) { this.precioMayor = precioMayor; }

    public Double getGanancia() { return ganancia; }
    public void setGanancia(Double ganancia) { this.ganancia = ganancia; }

    public LocalDate getFechaRegistro() { return fechaRegistro; }
    public void setFechaRegistro(LocalDate fechaRegistro) { this.fechaRegistro = fechaRegistro; }

    public LocalDate getFechaVencimiento() { return fechaVencimiento; }
    public void setFechaVencimiento(LocalDate fechaVencimiento) { this.fechaVencimiento = fechaVencimiento; }

    public Double getPrecioSugerido() { return precioSugerido; }
    public void setPrecioSugerido(Double precioSugerido) { this.precioSugerido = precioSugerido; }

    public Double getPrecioMinimo() { return precioMinimo; }
    public void setPrecioMinimo(Double precioMinimo) { this.precioMinimo = precioMinimo; }

    public String getMotivoSugerido() { return motivoSugerido; }
    public void setMotivoSugerido(String motivoSugerido) { this.motivoSugerido = motivoSugerido; }

    public Boolean getOfertaActiva() { return ofertaActiva; }
    public void setOfertaActiva(Boolean ofertaActiva) { this.ofertaActiva = ofertaActiva; }

    public String getSubcategoria() { return subcategoria; }
    public void setSubcategoria(String subcategoria) { this.subcategoria = subcategoria; }

    public Categoria getCategoria() { return categoria; }
    public void setCategoria(Categoria categoria) { this.categoria = categoria; }

    public Proveedor getProveedor() { return proveedor; }
    public void setProveedor(Proveedor proveedor) { this.proveedor = proveedor; }
}