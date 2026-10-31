
package jar.repository;

import jar.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UsuarioRepository
        extends JpaRepository<Usuario, Long> {

    // Buscar usuário pelo e-mail
    Optional<Usuario> findByEmail(String email);

    // Verificar se o e-mail já está cadastrado
    boolean existsByEmail(String email);
}
