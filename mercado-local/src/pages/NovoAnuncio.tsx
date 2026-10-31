
import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'

import {
  adicionarAnuncio,
  atualizarAnuncio,
  buscarAnuncioBanco,
  type Anuncio,
} from '../services/anuncios'

import './Anuncios.css'

const imagemPadrao =
  'https://images.unsplash.com/photo-1547592180-85f173990554?w=700'

export default function NovoAnuncio() {
  const navigate = useNavigate()
  const { id } = useParams()

  const [anuncioExistente, setAnuncioExistente] =
    useState<Anuncio | undefined>()

  const [carregando, setCarregando] = useState(Boolean(id))
  const [salvando, setSalvando] = useState(false)

  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [preco, setPreco] = useState('')
  const [categoria, setCategoria] = useState('')
  const [imagem, setImagem] = useState('')
  const [erro, setErro] = useState('')

  useEffect(() => {
    let ativo = true

    async function carregar() {
      setErro('')
      setAnuncioExistente(undefined)
      setNome('')
      setDescricao('')
      setPreco('')
      setCategoria('')
      setImagem('')

      if (!id) {
        setCarregando(false)
        return
      }

      setCarregando(true)

      try {
        const anuncio = await buscarAnuncioBanco(id)

        if (!ativo) return

        setAnuncioExistente(anuncio)

        if (anuncio) {
          setNome(anuncio.nome)
          setDescricao(anuncio.descricao)
          setPreco(String(anuncio.preco))
          setCategoria(anuncio.categoria)
          setImagem(anuncio.imagem)
        }
      } catch (error) {
        if (ativo) {
          console.error(error)
          setErro('Não foi possível carregar o anúncio.')
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
  }, [id])

  async function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    setErro('')

    const valor = Number(preco.replace(',', '.'))

    if (!nome.trim() || !descricao.trim() || !categoria || !preco.trim()) {
      setErro('Preencha todos os campos obrigatórios.')
      return
    }

    if (!Number.isFinite(valor) || valor <= 0) {
      setErro('Informe um preço válido maior que zero.')
      return
    }

    const anuncio: Anuncio = {
      id: anuncioExistente?.id || '',
      nome: nome.trim(),
      descricao: descricao.trim(),
      preco: valor,
      categoria,
      imagem: imagem.trim() || imagemPadrao,
      vendedor: anuncioExistente?.vendedor || 'Meu negócio',
    }

    setSalvando(true)

    try {
      if (anuncioExistente) {
        await atualizarAnuncio(anuncio)
      } else {
        await adicionarAnuncio(anuncio)
      }

      navigate('/meus-anuncios')
    } catch (error) {
      console.error(error)
      setErro(
        'Não foi possível salvar o anúncio. Verifique se o backend está funcionando.'
      )
    } finally {
      setSalvando(false)
    }
  }

  if (carregando) {
    return (
      <main className="anuncios-pagina">
        <div className="anuncios-vazio">
          <h1>Carregando anúncio...</h1>
        </div>
      </main>
    )
  }

  if (id && !anuncioExistente) {
    return (
      <main className="anuncios-pagina">
        <div className="anuncios-vazio">
          <h1>Anúncio não encontrado</h1>
          {erro && <p role="alert">{erro}</p>}
          <Link to="/meus-anuncios">
            Voltar para meus anúncios
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="anuncios-pagina">
      <div className="anuncios-form-container">

        <Link to="/meus-anuncios" className="anuncios-voltar">
          <ArrowLeft size={18} />
          Voltar para meus anúncios
        </Link>

        <h1>
          {anuncioExistente ? 'Editar Anúncio' : 'Novo Anúncio'}
        </h1>

        <p>
          Preencha as informações do produto que deseja anunciar.
        </p>

        <form className="anuncios-formulario" onSubmit={salvar}>

          <label htmlFor="anuncio-nome">Nome do produto *</label>
          <input
            id="anuncio-nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex.: Torta de Frango"
          />

          <label htmlFor="anuncio-descricao">Descrição *</label>
          <textarea
            id="anuncio-descricao"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Descreva seu produto..."
            rows={5}
          />

          <label htmlFor="anuncio-preco">Preço (R$) *</label>
          <input
            id="anuncio-preco"
            type="text"
            inputMode="decimal"
            value={preco}
            onChange={(e) => setPreco(e.target.value)}
            placeholder="Ex.: 35,00"
          />

          <label htmlFor="anuncio-categoria">Categoria *</label>
          <select
            id="anuncio-categoria"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
          >
            <option value="">Selecione uma categoria</option>
            <option value="Salgados">Salgados</option>
            <option value="Doces">Doces</option>
            <option value="Bolos e tortas">Bolos e tortas</option>
            <option value="Bebidas">Bebidas</option>
            <option value="Outros">Outros</option>
          </select>

          <label htmlFor="anuncio-imagem">
            URL da imagem (opcional)
          </label>
          <input
            id="anuncio-imagem"
            type="url"
            value={imagem}
            onChange={(e) => setImagem(e.target.value)}
            placeholder="https://exemplo.com/imagem.jpg"
          />

          {erro && (
            <p className="anuncios-erro" role="alert">
              {erro}
            </p>
          )}

          <button
            type="submit"
            className="anuncios-botao"
            disabled={salvando}
          >
            <Save size={18} />
            {salvando
              ? 'Salvando...'
              : anuncioExistente
                ? 'Salvar alterações'
                : 'Publicar anúncio'}
          </button>

        </form>
      </div>
    </main>
  )
}
