
package jar.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "pedidos")
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "comprador_id", nullable = false)
    private Usuario comprador;

    @Column(nullable = false)
    private LocalDateTime data = LocalDateTime.now();

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false)
    private String telefone;

    @Column(nullable = false)
    private String endereco;

    @Column(nullable = false)
    private String numero;

    @Column(nullable = false)
    private String bairro;

    @Column(nullable = false)
    private String cidade;

    private String complemento;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal total = BigDecimal.ZERO;

    @Column(nullable = false)
    private String status = "CONFIRMADO";

    @OneToMany(
        mappedBy = "pedido",
        cascade = CascadeType.ALL,
        orphanRemoval = true
    )
    private List<ItemPedido> itens = new ArrayList<>();

    public Pedido() {}

    public void adicionarItem(ItemPedido item) {
        item.setPedido(this);
        itens.add(item);
    }

    public Long getId() { return id; }

    public Usuario getComprador() { return comprador; }
    public void setComprador(Usuario comprador) {
        this.comprador = comprador;
    }

    public LocalDateTime getData() { return data; }
    public void setData(LocalDateTime data) {
        this.data = data;
    }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getTelefone() { return telefone; }
    public void setTelefone(String telefone) {
        this.telefone = telefone;
    }

    public String getEndereco() { return endereco; }
    public void setEndereco(String endereco) {
        this.endereco = endereco;
    }

    public String getNumero() { return numero; }
    public void setNumero(String numero) {
        this.numero = numero;
    }

    public String getBairro() { return bairro; }
    public void setBairro(String bairro) {
        this.bairro = bairro;
    }

    public String getCidade() { return cidade; }
    public void setCidade(String cidade) {
        this.cidade = cidade;
    }

    public String getComplemento() { return complemento; }
    public void setComplemento(String complemento) {
        this.complemento = complemento;
    }

    public BigDecimal getTotal() { return total; }
    public void setTotal(BigDecimal total) {
        this.total = total;
    }

    public String getStatus() { return status; }
    public void setStatus(String status) {
        this.status = status;
    }

    public List<ItemPedido> getItens() { return itens; }
}
