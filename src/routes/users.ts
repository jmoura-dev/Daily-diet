import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { hash } from 'bcrypt'

export async function usersRoutes(app: FastifyInstance) {
  app.post('/', async (req, res) => {
    const definitionSchemaUsers = z.object({
      name: z.string(),
      email: z.string(),
      password: z.string(),
    })

    const { name, email, password } = definitionSchemaUsers.parse(req.body)

    const checkEmailExists = await knex('users').where({ email }).first()

    if (checkEmailExists) {
      throw new Error('Este e-mail já está sendo usado.')
    }

    if (!name || !email || !password) {
      throw new Error('[401] Preecha todos os campos para se registrar.')
    }

    const hashedPassword = await hash(password, 8)

    await knex('users').insert({
      id: randomUUID(),
      name,
      email,
      password: hashedPassword,
    })

    return res.status(201).send()
  })

  app.get('/', async (req, res) => {
    const user = await knex('users').select('*')

    return res.status(200).send(user)
  })

  app.delete('/:id', async (req, res) => {
    const createSchemaDeleteMeal = z.object({
      id: z.string(),
    })

    const { id } = createSchemaDeleteMeal.parse(req.params)

    const user = await knex('users').where({ id }).delete()

    if (!user) {
      throw new Error('Usuário não identificado.')
    }

    return res.status(200).send()
  })
}
