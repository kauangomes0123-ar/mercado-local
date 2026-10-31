
package jar.controller;

import jar.model.Produto;
import jar.model.Usuario;
import jar.repository.ProdutoRepository;
import jar.repository.UsuarioRepository;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/produtos")
public class ProdutoController {

    private final ProdutoRepository produtoRepository;
    private final UsuarioRepository usuarioRepository;

    public ProdutoController(
            ProdutoRepository produtoRepository,
            UsuarioRepository usuarioRepository
    ) {
        this.produtoRepository = produtoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    // ========================================
    // DADOS RECEBIDOS DO REACT
    // ========================================

    public record ProdutoRequest(
            @NotBlank String nome,
            String descricao,
            @NotNull @DecimalMin("0.01") BigDecimal preco,
            @NotBlank String categoria,
            String imagem
    ) {}

    // ========================================
    // DADOS RETORNADOS AO REACT
    // ========================================

    public record ProdutoResponse(
            Long id,
            String nome,
            String descricao,
            BigDecimal preco,
            String categoria,
            String imagem,
            String vendedor,
            Long usuarioId
    ) {}

    // ========================================
    // CONVERTER PRODUTO PARA RESPOSTA
    // ========================================

    private ProdutoResponse converter(Produto produto) {

        return new ProdutoResponse(
                produto.getId(),
                produto.getNome(),
                produto.getDescricao(),
                produto.getPreco(),
                produto.getCategoria(),
                produto.getImagem(),
                produto.getVendedor(),
                produto.getUsuario() != null
                        ? produto.getUsuario().getId()
                        : null
        );
    }

    // ========================================
    // BUSCAR USUÁRIO AUTENTICADO
    // ========================================

    private Usuario buscarUsuario(Authentication authentication) {

        if (authentication == null ||
                !authentication.isAuthenticated()) {
            return null;
        }

        return usuarioRepository
                .findByEmail(authentication.getName())
                .orElse(null);
    }

    // ========================================
    // LISTAR PRODUTOS DISPONÍVEIS
    // ========================================

    @GetMapping
    public List<ProdutoResponse> listar() {

        // Somente produtos ativos e vinculados
        // a usuários cadastrados aparecem na vitrine.

        return produtoRepository
                .findByAtivoTrueAndUsuarioIsNotNull()
                .stream()
                .map(this::converter)
                .toList();
    }

    // ========================================
    // BUSCAR PRODUTO DISPONÍVEL POR ID
    // ========================================

    @GetMapping("/{id}")
    public ResponseEntity<ProdutoResponse> buscar(
            @PathVariable Long id
    ) {

        return produtoRepository
                .findByIdAndAtivoTrueAndUsuarioIsNotNull(id)
                .map(produto ->
                        ResponseEntity.ok(converter(produto))
                )
                .orElseGet(() ->
                        ResponseEntity.notFound().build()
                );
    }

    // ========================================
    // CADASTRAR PRODUTO
    // ========================================

    @PostMapping
    public ResponseEntity<?> cadastrar(
            @Valid @RequestBody ProdutoRequest dados,
            Authentication authentication
    ) {

        Usuario usuario = buscarUsuario(authentication);

        if (usuario == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "erro",
                            "Você precisa fazer login."
                    ));
        }

        Produto produto = new Produto();

        produto.setNome(dados.nome());
        produto.setDescricao(dados.descricao());
        produto.setPreco(dados.preco());
        produto.setCategoria(dados.categoria());
        produto.setImagem(dados.imagem());

        // Vincula o anúncio ao usuário autenticado.
        produto.setVendedor(usuario.getNome());
        produto.setUsuario(usuario);

        // Todo anúncio novo começa ativo.
        produto.setAtivo(true);

        Produto salvo = produtoRepository.save(produto);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(converter(salvo));
    }

    // ========================================
    // ATUALIZAR PRODUTO
    // ========================================

    @PutMapping("/{id}")
    public ResponseEntity<?> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody ProdutoRequest dados,
            Authentication authentication
    ) {

        Usuario usuario = buscarUsuario(authentication);

        if (usuario == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "erro",
                            "Você precisa fazer login."
                    ));
        }

        Produto produto = produtoRepository
                .findById(id)
                .orElse(null);

        if (produto == null || !produto.isAtivo()) {
            return ResponseEntity.notFound().build();
        }

        // Apenas o proprietário pode editar.
        if (produto.getUsuario() == null ||
                !produto.getUsuario().getId()
                        .equals(usuario.getId())) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(Map.of(
                            "erro",
                            "Você não tem permissão para editar este anúncio."
                    ));
        }

        produto.setNome(dados.nome());
        produto.setDescricao(dados.descricao());
        produto.setPreco(dados.preco());
        produto.setCategoria(dados.categoria());
        produto.setImagem(dados.imagem());

        // Preserva o proprietário original.

        Produto atualizado = produtoRepository.save(produto);

        return ResponseEntity.ok(converter(atualizado));
    }

    // ========================================
    // EXCLUIR ANÚNCIO (EXCLUSÃO LÓGICA)
    // ========================================

    @DeleteMapping("/{id}")
    public ResponseEntity<?> excluir(
            @PathVariable Long id,
            Authentication authentication
    ) {

        Usuario usuario = buscarUsuario(authentication);

        if (usuario == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "erro",
                            "Você precisa fazer login."
                    ));
        }

        Produto produto = produtoRepository
                .findById(id)
                .orElse(null);

        if (produto == null || !produto.isAtivo()) {
            return ResponseEntity.notFound().build();
        }

        // Apenas o proprietário pode excluir.
        if (produto.getUsuario() == null ||
                !produto.getUsuario().getId()
                        .equals(usuario.getId())) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(Map.of(
                            "erro",
                            "Você não tem permissão para excluir este anúncio."
                    ));
        }

        // Desativa o produto sem apagar do banco.
        produto.setAtivo(false);

        produtoRepository.save(produto);

        return ResponseEntity.noContent().build();
    }
}
