
const API_URL = `http://${window.location.hostname}:8080/api/usuarios`

export type DadosCadastro = {
  nome: string
  email: string
  telefone: string
  senha: string
}

export type Usuario = {
  id: number
  nome: string
  email: string
  telefone: string
}

export async function cadastrarUsuario(
  dados: DadosCadastro
): Promise<Usuario> {
  let resposta: Response

  try {
    resposta = await fetch(`${API_URL}/cadastro`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...dados,
        email: dados.email.trim().toLowerCase(),
        telefone: dados.telefone.replace(/\D/g, ''),
      }),
    })
  } catch {
    throw new Error(
      'Não foi possível conectar ao servidor. Verifique se o Spring Boot está funcionando.'
    )
  }

  if (resposta.status === 409) {
    throw new Error('Este e-mail já está cadastrado.')
  }

  if (resposta.status === 400) {
    throw new Error('Confira os dados preenchidos e tente novamente.')
  }

  if (!resposta.ok) {
    throw new Error('Não foi possível realizar o cadastro.')
  }

  return resposta.json()
}

export async function fazerLogin(
  email: string,
  senha: string
): Promise<Usuario> {
  let resposta: Response

  try {
    resposta = await fetch(`${API_URL}/login`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        senha,
      }),
    })
  } catch {
    throw new Error(
      'Não foi possível conectar ao servidor. Verifique se o Spring Boot está funcionando.'
    )
  }

  if (resposta.status === 401) {
    throw new Error('E-mail ou senha incorretos.')
  }

  if (resposta.status === 400) {
    throw new Error('Informe um e-mail e uma senha válidos.')
  }

  if (!resposta.ok) {
    throw new Error('Não foi possível realizar o login.')
  }

  return resposta.json()
}

export async function buscarUsuarioAtual(): Promise<Usuario | null> {
  let resposta: Response

  try {
    resposta = await fetch(`${API_URL}/me`, {
      method: 'GET',
      credentials: 'include',
    })
  } catch {
    throw new Error('Não foi possível conectar ao servidor.')
  }

  if (resposta.status === 401 || resposta.status === 403) {
    return null
  }

  if (!resposta.ok) {
    throw new Error(
      'Não foi possível consultar o usuário conectado.'
    )
  }

  return resposta.json()
}

export async function sairDaConta(): Promise<void> {
  let resposta: Response

  try {
    resposta = await fetch(`${API_URL}/logout`, {
      method: 'POST',
      credentials: 'include',
    })
  } catch {
    throw new Error(
      'Não foi possível conectar ao servidor para sair da conta.'
    )
  }

  if (!resposta.ok) {
    throw new Error('Não foi possível encerrar a sessão.')
  }

  sessionStorage.removeItem('mercadoLocalUsuario')
}
