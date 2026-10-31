
package jar.controller;

import jar.model.ItemPedido;
import jar.model.Pedido;
import jar.model.Produto;
import jar.model.Usuario;

import jar.repository.PedidoRepository;
import jar.repository.ProdutoRepository;
import jar.repository.UsuarioRepository;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/pedidos")
public class PedidoController {

    private final PedidoRepository pedidoRepository;
    private final ProdutoRepository produtoRepository;
    private final UsuarioRepository usuarioRepository;

    public PedidoController(
            PedidoRepository pedidoRepository,
            ProdutoRepository produtoRepository,
            UsuarioRepository usuarioRepository
    ) {
        this.pedidoRepository = pedidoRepository;
        this.produtoRepository = produtoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public record ItemRequest(
            @NotNull Long produtoId,
            @NotNull @Min(1) @Max(1000) Integer quantidade
    ) {}

    public record PedidoRequest(
            @NotBlank String nome,
            @NotBlank
            @Pattern(regexp = "\\d{10,11}")
            String telefone,
            @NotBlank String endereco,
            @NotBlank String numero,
            @NotBlank String bairro,
            @NotBlank String cidade,
            String complemento,
            @NotEmpty List<@Valid ItemRequest> itens
    ) {}

    public record PedidoResponse(
            Long id,
            LocalDateTime data,
            BigDecimal total,
            String status
    ) {}

    public record ItemRecebidoResponse(
            Long produtoId,
            String nomeProduto,
            Integer quantidade,
            BigDecimal precoUnitario,
            BigDecimal subtotal
    ) {}

    public record PedidoRecebidoResponse(
            Long id,
            LocalDateTime data,
            String comprador,
            String status,
            BigDecimal totalVendedor,
            List<ItemRecebidoResponse> itens
    ) {}

    private Usuario obterUsuario(Authentication autenticacao) {
        if (autenticacao == null ||
                !autenticacao.isAuthenticated()) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Faça login para continuar."
            );
        }

        return usuarioRepository
                .findByEmail(autenticacao.getName())
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.UNAUTHORIZED,
                                "Usuário não encontrado."
                        )
                );
    }

    private PedidoResponse converter(Pedido pedido) {
        return new PedidoResponse(
                pedido.getId(),
                pedido.getData(),
                pedido.getTotal(),
                pedido.getStatus()
        );
    }

    private PedidoRecebidoResponse converterRecebido(
            Pedido pedido,
            Long vendedorId
    ) {
        List<ItemRecebidoResponse> itensVendedor =
                pedido.getItens()
                        .stream()
                        .filter(item ->
                                item.getProduto().getUsuario() != null
                                && vendedorId.equals(
                                        item.getProduto()
                                                .getUsuario()
                                                .getId()
                                )
                        )
                        .map(item -> new ItemRecebidoResponse(
                                item.getProduto().getId(),
                                item.getNomeProduto(),
                                item.getQuantidade(),
                                item.getPrecoUnitario(),
                                item.getSubtotal()
                        ))
                        .toList();

        BigDecimal totalVendedor = itensVendedor.stream()
                .map(ItemRecebidoResponse::subtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new PedidoRecebidoResponse(
                pedido.getId(),
                pedido.getData(),
                pedido.getNome(),
                pedido.getStatus(),
                totalVendedor,
                itensVendedor
        );
    }

    @PostMapping
    @Transactional
    public ResponseEntity<PedidoResponse> criar(
            @Valid @RequestBody PedidoRequest dados,
            Authentication autenticacao
    ) {
        Usuario comprador = obterUsuario(autenticacao);

        Pedido pedido = new Pedido();

        pedido.setComprador(comprador);
        pedido.setNome(dados.nome().trim());
        pedido.setTelefone(dados.telefone());
        pedido.setEndereco(dados.endereco().trim());
        pedido.setNumero(dados.numero().trim());
        pedido.setBairro(dados.bairro().trim());
        pedido.setCidade(dados.cidade().trim());
        pedido.setComplemento(dados.complemento());
        pedido.setStatus("CONFIRMADO");

        BigDecimal total = BigDecimal.ZERO;

        for (ItemRequest item : dados.itens()) {
            Produto produto = produtoRepository
                    .findById(item.produtoId())
                    .orElseThrow(() ->
                            new ResponseStatusException(
                                    HttpStatus.BAD_REQUEST,
                                    "Um produto não está mais disponível."
                            )
                    );

            BigDecimal preco = produto.getPreco();

            if (preco == null ||
                    preco.compareTo(BigDecimal.ZERO) <= 0) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Produto com preço inválido."
                );
            }

            BigDecimal subtotal = preco.multiply(
                    BigDecimal.valueOf(item.quantidade())
            );

            ItemPedido novoItem = new ItemPedido();

            novoItem.setProduto(produto);
            novoItem.setNomeProduto(produto.getNome());
            novoItem.setQuantidade(item.quantidade());
            novoItem.setPrecoUnitario(preco);
            novoItem.setSubtotal(subtotal);

            pedido.adicionarItem(novoItem);

            total = total.add(subtotal);
        }

        pedido.setTotal(total);

        Pedido salvo = pedidoRepository.saveAndFlush(pedido);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(converter(salvo));
    }

    @GetMapping("/meus")
    @Transactional(readOnly = true)
    public List<PedidoResponse> meusPedidos(
            Authentication autenticacao
    ) {
        Usuario comprador = obterUsuario(autenticacao);

        return pedidoRepository
                .findByCompradorIdOrderByDataDesc(
                        comprador.getId()
                )
                .stream()
                .map(this::converter)
                .toList();
    }

    @GetMapping("/recebidos")
    @Transactional(readOnly = true)
    public List<PedidoRecebidoResponse> pedidosRecebidos(
            Authentication autenticacao
    ) {
        Usuario vendedor = obterUsuario(autenticacao);

        return pedidoRepository
                .buscarPedidosRecebidos(vendedor.getId())
                .stream()
                .map(pedido ->
                        converterRecebido(
                                pedido,
                                vendedor.getId()
                        )
                )
                .toList();
    }

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public PedidoResponse buscar(
            @PathVariable Long id,
            Authentication autenticacao
    ) {
        Usuario comprador = obterUsuario(autenticacao);

        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Pedido não encontrado."
                        )
                );

        if (!pedido.getComprador().getId()
                .equals(comprador.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Pedido não encontrado."
            );
        }

        return converter(pedido);
    }
}
