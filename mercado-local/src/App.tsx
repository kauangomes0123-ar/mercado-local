
import { useEffect, useState } from 'react'

import {
  BrowserRouter,
  Link,
  Route,
  Routes,
} from 'react-router-dom'

import {
  ShoppingCart,
  Store,
  UserRound,
  Package,
  LogIn,
  UserPlus,
  ArrowRight,
  MapPin,
  ShoppingBag,
} from 'lucide-react'

import Login from './pages/Login'
import Cadastro from './pages/Cadastro'
import Perfil from './pages/Perfil'
import MeusAnuncios from './pages/MeusAnuncios'
import MeusPedidos from './pages/MeusPedidos'
import PedidosRecebidos from './pages/PedidosRecebidos'
import NovoAnuncio from './pages/NovoAnuncio'
import DetalhesProduto from './pages/DetalhesProduto'
import Carrinho from './pages/Carrinho'
import Checkout from './pages/Checkout'
import PedidoSucesso from './pages/PedidoSucesso'

import { listarTodosProdutos } from './services/produtos'
import type { Anuncio } from './services/anuncios'

import './App.css'

function Cabecalho() {
  return (
    <header className="cabecalho">
      <div className="cabecalho-conteudo">
        <Link to="/" className="logo">
          <Store size={28} />
          <span>Mercado Local</span>
        </Link>

        <nav className="menu" aria-label="Navegação principal">
          <Link to="/meus-anuncios">
            <Package size={18} />
            Meus anúncios
          </Link>

          <Link to="/meus-pedidos">
            <ShoppingBag size={18} />
            Meus pedidos
          </Link>

          <Link to="/pedidos-recebidos">
            <Store size={18} />
            Pedidos recebidos
          </Link>

          <Link to="/perfil">
            <UserRound size={18} />
            Perfil
          </Link>

          <Link to="/carrinho">
            <ShoppingCart size={18} />
            Carrinho
          </Link>

          <Link to="/login">
            <LogIn size={18} />
            Login
          </Link>

          <Link to="/cadastro" className="botao-cadastro">
            <UserPlus size={18} />
            Cadastro
          </Link>
        </nav>
      </div>
    </header>
  )
}

function Home() {
  const [produtos, setProdutos] = useState<Anuncio[]>([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    let ativo = true

    async function carregarProdutos() {
      try {
        const lista = await listarTodosProdutos()

        if (ativo) {
          setProdutos(lista)
        }
      } catch (erro) {
        console.error('Erro ao carregar produtos:', erro)
      } finally {
        if (ativo) {
          setCarregando(false)
        }
      }
    }

    carregarProdutos()

    return () => {
      ativo = false
    }
  }, [])

  return (
    <>
      <section className="banner">
        <div className="banner-conteudo">
          <span className="etiqueta">
            <MapPin size={16} />
            Valorize o comércio da sua região
          </span>

          <h1>Encontre sabores perto de você!</h1>

          <p>
            Descubra comidas, lanches, doces e produtos preparados
            por negócios da sua região. Conheça novos vendedores
            e faça seus pedidos de forma simples e prática.
          </p>

          <a href="#produtos" className="botao-principal">
            Explorar produtos
            <ArrowRight size={19} />
          </a>
        </div>
      </section>

      <main className="conteudo" id="produtos">
        <div className="secao-titulo">
          <div>
            <span className="subtitulo">
              Feito com carinho, pertinho de você
            </span>

            <h2>🌟 Produtos disponíveis</h2>
          </div>

          <p>
            Conheça os produtos anunciados pelos vendedores
            do Mercado Local.
          </p>
        </div>

        {carregando ? (
          <p>Carregando produtos...</p>
        ) : produtos.length === 0 ? (
          <p>Nenhum produto disponível no momento.</p>
        ) : (
          <div className="grade-produtos">
            {produtos.map((produto) => (
              <article
                className="cartao-produto"
                key={produto.id}
              >
                <img
                  src={produto.imagem}
                  alt={produto.nome}
                  className="imagem-produto"
                />

                <div className="informacoes-produto">
                  <span className="vendedor">
                    {produto.vendedor}
                  </span>

                  <h3>{produto.nome}</h3>

                  <p>{produto.descricao}</p>

                  <div className="produto-rodape">
                    <strong>
                      {produto.preco.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </strong>

                    <Link
                      to={`/produto/${produto.id}`}
                      className="botao-produto"
                    >
                      Ver produto
                      <ArrowRight size={17} />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </>
  )
}

function PaginaTemporaria({
  titulo,
}: {
  titulo: string
}) {
  return (
    <main className="pagina-temporaria">
      <div className="pagina-temporaria-card">
        <Store size={45} color="#138e68" />

        <h1>{titulo}</h1>

        <p>
          A página solicitada não foi encontrada.
        </p>

        <Link to="/" className="botao-principal">
          Voltar para a Home
          <ArrowRight size={18} />
        </Link>
      </div>
    </main>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Cabecalho />

      <Routes>
        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/cadastro"
          element={<Cadastro />}
        />

        <Route
          path="/perfil"
          element={<Perfil />}
        />

        <Route
          path="/meus-anuncios"
          element={<MeusAnuncios />}
        />

        <Route
          path="/meus-pedidos"
          element={<MeusPedidos />}
        />

        <Route
          path="/pedidos-recebidos"
          element={<PedidosRecebidos />}
        />

        <Route
          path="/novo-anuncio"
          element={<NovoAnuncio />}
        />

        <Route
          path="/editar-anuncio/:id"
          element={<NovoAnuncio />}
        />

        <Route
          path="/produto/:id"
          element={<DetalhesProduto />}
        />

        <Route
          path="/carrinho"
          element={<Carrinho />}
        />

        <Route
          path="/checkout"
          element={<Checkout />}
        />

        <Route
          path="/pedido-sucesso/:id"
          element={<PedidoSucesso />}
        />

        <Route
          path="*"
          element={
            <PaginaTemporaria
              titulo="Página não encontrada"
            />
          }
        />
      </Routes>

      <footer className="rodape">
        © 2026 Mercado Local — Conectando você aos sabores da sua região.
      </footer>
    </BrowserRouter>
  )
}

export default App
