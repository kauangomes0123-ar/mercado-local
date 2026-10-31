
package jar.repository;

import jar.model.Produto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProdutoRepository extends JpaRepository<Produto, Long> {

    // Somente anúncios ativos vinculados a usuários
    List<Produto> findByAtivoTrueAndUsuarioIsNotNull();

    // Buscar produto ativo e vinculado a usuário
    Optional<Produto> findByIdAndAtivoTrueAndUsuarioIsNotNull(Long id);

    // Mantido para compatibilidade com outros usos
    List<Produto> findByAtivoTrue();

    Optional<Produto> findByIdAndAtivoTrue(Long id);
}
