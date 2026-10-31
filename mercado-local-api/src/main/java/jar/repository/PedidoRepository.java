
package jar.repository;

import jar.model.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    List<Pedido> findByCompradorIdOrderByDataDesc(
            Long compradorId
    );

    @Query("""
        SELECT DISTINCT p
        FROM Pedido p
        JOIN p.itens i
        JOIN i.produto produto
        WHERE produto.usuario.id = :vendedorId
        ORDER BY p.data DESC
    """)
    List<Pedido> buscarPedidosRecebidos(
            @Param("vendedorId") Long vendedorId
    );
}
