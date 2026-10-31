
package jar.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import jar.model.Usuario;
import jar.repository.UsuarioRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;

import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioController(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // ========================================
    // CADASTRO
    // ========================================

    @PostMapping("/cadastro")
    public ResponseEntity<?> cadastrar(
            @RequestBody Map<String, String> dados
    ) {

        String nome = dados.get("nome");
        String email = dados.get("email");
        String telefone = dados.get("telefone");
        String senha = dados.get("senha");

        if (nome == null || nome.isBlank()
                || email == null || email.isBlank()
                || telefone == null || telefone.isBlank()
                || senha == null || senha.isBlank()) {

            return ResponseEntity.badRequest().body(
                    Map.of("mensagem", "Preencha todos os campos.")
            );
        }

        nome = nome.trim();
        email = email.trim().toLowerCase();
        telefone = telefone.replaceAll("\\D", "");

        if (usuarioRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(
                    Map.of("mensagem", "Este e-mail já está cadastrado.")
            );
        }

        Usuario usuario = new Usuario();

        usuario.setNome(nome);
        usuario.setEmail(email);
        usuario.setTelefone(telefone);
        usuario.setSenhaHash(passwordEncoder.encode(senha));

        Usuario salvo = usuarioRepository.save(usuario);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(dadosPublicos(salvo));
    }

    // ========================================
    // LOGIN
    // ========================================

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody Map<String, String> dados,
            HttpServletRequest request,
            HttpServletResponse response
    ) {

        String email = dados.get("email");
        String senha = dados.get("senha");

        if (email == null || email.isBlank()
                || senha == null || senha.isBlank()) {

            return ResponseEntity.badRequest().body(
                    Map.of("mensagem", "Informe email e senha.")
            );
        }

        email = email.trim().toLowerCase();

        Optional<Usuario> usuarioEncontrado =
                usuarioRepository.findByEmail(email);

        if (usuarioEncontrado.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    Map.of("mensagem", "Email ou senha inválidos.")
            );
        }

        Usuario usuario = usuarioEncontrado.get();

        if (!passwordEncoder.matches(senha, usuario.getSenhaHash())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    Map.of("mensagem", "Email ou senha inválidos.")
            );
        }

        HttpSession sessaoAnterior = request.getSession(false);

        if (sessaoAnterior != null) {
            sessaoAnterior.invalidate();
        }

        request.getSession(true);

        Authentication autenticacao =
                new UsernamePasswordAuthenticationToken(
                        usuario.getEmail(),
                        null,
                        Collections.emptyList()
                );

        SecurityContext contexto =
                SecurityContextHolder.createEmptyContext();

        contexto.setAuthentication(autenticacao);
        SecurityContextHolder.setContext(contexto);

        HttpSessionSecurityContextRepository repositorioContexto =
                new HttpSessionSecurityContextRepository();

        repositorioContexto.saveContext(
                contexto,
                request,
                response
        );

        return ResponseEntity.ok(dadosPublicos(usuario));
    }

    // ========================================
    // CONSULTAR USUÁRIO LOGADO
    // ========================================

    @GetMapping("/me")
    public ResponseEntity<?> usuarioLogado() {

        Authentication autenticacao =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (autenticacao == null
                || !autenticacao.isAuthenticated()
                || "anonymousUser".equals(autenticacao.getPrincipal())) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .build();
        }

        String email = autenticacao.getName();

        Optional<Usuario> usuarioEncontrado =
                usuarioRepository.findByEmail(email);

        if (usuarioEncontrado.isEmpty()) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .build();
        }

        return ResponseEntity.ok(
                dadosPublicos(usuarioEncontrado.get())
        );
    }

    // ========================================
    // ATUALIZAR PERFIL
    // ========================================

    @PutMapping("/me")
    public ResponseEntity<?> atualizarPerfil(
            @RequestBody Map<String, String> dados,
            HttpServletRequest request,
            HttpServletResponse response
    ) {

        Authentication autenticacao =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (autenticacao == null
                || !autenticacao.isAuthenticated()
                || "anonymousUser".equals(autenticacao.getPrincipal())) {

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    Map.of("mensagem", "Faça login para editar seu perfil.")
            );
        }

        Optional<Usuario> usuarioEncontrado =
                usuarioRepository.findByEmail(autenticacao.getName());

        if (usuarioEncontrado.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    Map.of("mensagem", "Usuário não encontrado.")
            );
        }

        String nome = dados.get("nome");
        String email = dados.get("email");
        String telefone = dados.get("telefone");

        if (nome == null || nome.isBlank()
                || email == null || email.isBlank()
                || telefone == null || telefone.isBlank()) {

            return ResponseEntity.badRequest().body(
                    Map.of("mensagem", "Preencha todos os campos.")
            );
        }

        nome = nome.trim();
        email = email.trim().toLowerCase();
        telefone = telefone.replaceAll("\\D", "");

        if (!email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
            return ResponseEntity.badRequest().body(
                    Map.of("mensagem", "Informe um e-mail válido.")
            );
        }

        if (telefone.length() != 10 && telefone.length() != 11) {
            return ResponseEntity.badRequest().body(
                    Map.of("mensagem", "Informe um telefone válido com DDD.")
            );
        }

        Usuario usuario = usuarioEncontrado.get();

        boolean emailAlterado = !usuario.getEmail().equals(email);

        if (emailAlterado) {
            Optional<Usuario> outroUsuario =
                    usuarioRepository.findByEmail(email);

            if (outroUsuario.isPresent()) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(
                        Map.of("mensagem", "Este e-mail já está cadastrado.")
                );
            }
        }

        usuario.setNome(nome);
        usuario.setEmail(email);
        usuario.setTelefone(telefone);

        Usuario salvo = usuarioRepository.save(usuario);

        // Atualiza a autenticação se o e-mail mudou
        if (emailAlterado) {

            Authentication novaAutenticacao =
                    new UsernamePasswordAuthenticationToken(
                            salvo.getEmail(),
                            null,
                            Collections.emptyList()
                    );

            SecurityContext contexto =
                    SecurityContextHolder.createEmptyContext();

            contexto.setAuthentication(novaAutenticacao);
            SecurityContextHolder.setContext(contexto);

            HttpSessionSecurityContextRepository repositorioContexto =
                    new HttpSessionSecurityContextRepository();

            repositorioContexto.saveContext(
                    contexto,
                    request,
                    response
            );
        }

        return ResponseEntity.ok(dadosPublicos(salvo));
    }

    // ========================================
    // LOGOUT
    // ========================================

    @PostMapping("/logout")
    public ResponseEntity<?> logout(
            HttpServletRequest request
    ) {

        HttpSession sessao = request.getSession(false);

        if (sessao != null) {
            sessao.invalidate();
        }

        SecurityContextHolder.clearContext();

        return ResponseEntity.ok(
                Map.of("mensagem", "Logout realizado com sucesso.")
        );
    }

    // ========================================
    // DADOS PÚBLICOS DO USUÁRIO
    // ========================================

    private Map<String, Object> dadosPublicos(Usuario usuario) {

        return Map.of(
                "id", usuario.getId(),
                "nome", usuario.getNome(),
                "email", usuario.getEmail(),
                "telefone", usuario.getTelefone()
        );
    }
}
