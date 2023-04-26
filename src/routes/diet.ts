import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'

export async function mealRoutes(app: FastifyInstance) {
  app.post('/', async (req, res) => {
    const createSchemaMeal = z.object({
      name: z.string(),
      description: z.string(),
      isDiet: z.enum(['true', 'false']),
      user_id: z.string(),
    })

    const { name, description, isDiet } = createSchemaMeal.parse(req.body)
    const { user_id } = createSchemaMeal.parse(req.params)

    if (!name || !description || !isDiet) {
      throw new Error('[401] Preecha todos os campos para registar a refeição')
    }

    if (!user_id) {
      throw new Error('Usuário não identificado.')
    }

    await knex('meals').insert({
      id: randomUUID(),
      name,
      description,
      isDiet,
      user_id,
    })

    return res.status(201).send()
  })
}
