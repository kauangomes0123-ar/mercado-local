
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, LockKeyhole, Mail, Store } from 'lucide-react'
import { fazerLogin } from '../services/usuario'
import './Auth.css'

export default function Login() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function entrar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    setErro('')

    if (!email.trim() || !senha.trim()) {
      setErro('Preencha todos os campos.')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErro('Informe um e-mail válido.')
      return
    }

    setCarregando(true)

    try {
      const usuario = await fazerLogin(email, senha)

      // Apenas para exibir o usuário na interface durante
      // o desenvolvimento. Isto NÃO é uma sessão autenticada.
      sessionStorage.setItem(
        'mercadoLocalUsuario',
        JSON.stringify(usuario)
      )

      alert(`Bem-vindo ao Mercado Local, ${usuario.nome}!`)

      navigate('/')
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : 'Não foi possível realizar o login.'
      )
    } finally {
      setCarregando(false)
    }
  }

  return (
    <main className="auth-pagina">
      <section className="auth-card">
        <div className="auth-icone">
          <Store size={30} />
        </div>

        <h1>Bem-vindo de volta!</h1>

        <p className="auth-descricao">
          Entre no Mercado Local para comprar e anunciar seus produtos.
        </p>

        <form onSubmit={entrar} noValidate>
          <label htmlFor="login-email">E-mail</label>

          <div className="auth-campo">
            <Mail size={19} />

            <input
              id="login-email"
              type="email"
              placeholder="Digite seu e-mail"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <label htmlFor="login-senha">Senha</label>

          <div className="auth-campo">
            <LockKeyhole size={19} />

            <input
              id="login-senha"
              type={mostrarSenha ? 'text' : 'password'}
              placeholder="Digite sua senha"
              autoComplete="current-password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />

            <button
              type="button"
              className="auth-mostrar-senha"
              aria-label={
                mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'
              }
              onClick={() => setMostrarSenha(!mostrarSenha)}
            >
              {mostrarSenha ? (
                <EyeOff size={19} />
              ) : (
                <Eye size={19} />
              )}
            </button>
          </div>

          {erro && (
            <p className="auth-erro" role="alert">
              {erro}
            </p>
          )}

          <button
            type="submit"
            className="auth-botao"
            disabled={carregando}
          >
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="auth-rodape">
          Ainda não possui uma conta?{' '}
          <Link to="/cadastro">Cadastre-se</Link>
        </p>

        <Link to="/" className="auth-voltar">
          Voltar para a Home
        </Link>
      </section>
    </main>
  )
}
