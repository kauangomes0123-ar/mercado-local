
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2, Package } from 'lucide-react'

import {
  listarAnunciosBanco,
  excluirAnuncio,
  type Anuncio,
} from '../services/anuncios'

import {
  buscarUsuarioAtual,
  type Usuario,
} from '../services/usuario'

import './Anuncios.css'

export default function MeusAnuncios() {
  const [anuncios, setAnuncios] = useState<Anuncio[]>([])
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [excluindoId, setExcluindoId] = useState<string | null>(null)

  useEffect(() => {
    let ativo = true

    async function carregar() {
      try {
        const usuarioAtual = await buscarUsuarioAtual()

        if (!ativo) return

        setUsuario(usuarioAtual)

        if (!usuarioAtual) {
          setAnuncios([])
          return
        }

        const anunciosBanco = await listarAnunciosBanco()

        const meusAnuncios = anunciosBanco.filter(
          (anuncio) => anuncio.usuarioId === usuarioAtual.id
        )

        if (ativo) {
          setAnuncios(meusAnuncios)
        }
      } catch (error) {
        console.error(error)

        if (ativo) {
          setErro(
            error instanceof Error
              ? error.message
              : 'Não foi possível carregar seus anúncios.'
          )
        }
      } finally {
        if (ativo) {
          setCarregando(false)
        }
      }
    }

    carregar()

    return () => {
      ativo = false
    }
  }, [])

  async function remover(id: string) {
    if (!window.confirm('Deseja realmente excluir este anúncio?')) {
      return
    }

    setExcluindoId(id)
    setErro('')

    try {
      await excluirAnuncio(id)

      setAnuncios((atuais) =>
        atuais.filter((anuncio) => anuncio.id !== id)
      )
    } catch (error) {
      console.error(error)

      setErro(
        error instanceof Error
          ? error.message
          : 'Não foi possível excluir o anúncio.'
      )
    } finally {
      setExcluindoId(null)
    }
  }

  if (carregando) {
    return (
      <main className="anuncios-pagina">
        <div className="anuncios-container">
          <div className="anuncios-vazio">
            <p>Carregando seus anúncios...</p>
          </div>
        </div>
      </main>
    )
  }

  if (!usuario) {
    return (
      <main className="anuncios-pagina">
        <div className="anuncios-container">
          <div className="anuncios-vazio">
            <Package size={48} />

            <h2>
              {erro
                ? 'Não foi possível carregar seus anúncios'
                : 'Você precisa entrar na sua conta'}
            </h2>

            <p>
              {erro ||
                'Faça login para visualizar seus anúncios.'}
            </p>

            {erro ? (
              <button
                type="button"
                className="anuncios-botao"
                onClick={() => window.location.reload()}
              >
                Tentar novamente
              </button>
            ) : (
              <Link to="/login" className="anuncios-botao">
                Entrar na minha conta
              </Link>
            )}
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="anuncios-pagina">
      <div className="anuncios-container">

        <div className="anuncios-cabecalho">
          <div>
            <h1>Meus Anúncios</h1>
            <p>
              Gerencie os produtos anunciados
              por você no Mercado Local.
            </p>
          </div>

          <Link to="/novo-anuncio" className="anuncios-botao">
            <Plus size={19} />
            Novo anúncio
          </Link>
        </div>

        {erro && (
          <p className="anuncios-erro" role="alert">
            {erro}
          </p>
        )}

        {anuncios.length === 0 && !erro ? (
          <div className="anuncios-vazio">
            <Package size={48} />

            <h2>Nenhum anúncio cadastrado</h2>
            <p>
              Você ainda não publicou produtos nesta conta.
            </p>

            <Link to="/novo-anuncio" className="anuncios-botao">
              <Plus size={18} />
              Criar anúncio
            </Link>
          </div>
        ) : (
          <div className="anuncios-grade">
            {anuncios.map((anuncio) => (
              <article
                className="anuncios-card"
                key={anuncio.id}
              >
                <img
                  src={anuncio.imagem}
                  alt={anuncio.nome}
                />

                <div className="anuncios-card-conteudo">
                  <span className="anuncios-categoria">
                    {anuncio.categoria}
                  </span>

                  <h2>{anuncio.nome}</h2>
                  <p>{anuncio.descricao}</p>

                  <strong>
                    {anuncio.preco.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </strong>

                  <div className="anuncios-acoes">
                    <Link
                      to={`/editar-anuncio/${anuncio.id}`}
                      className="anuncios-editar"
                    >
                      <Pencil size={17} />
                      Editar
                    </Link>

                    <button
                      type="button"
                      className="anuncios-excluir"
                      onClick={() => remover(anuncio.id)}
                      disabled={excluindoId === anuncio.id}
                    >
                      <Trash2 size={17} />

                      {excluindoId === anuncio.id
                        ? 'Excluindo...'
                        : 'Excluir'}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
