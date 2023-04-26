import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'

export async function mealRoutes(app: FastifyInstance) {
  app.post('/:userId', async (req, res) => {
    const createSchemaMeal = z.object({
      name: z.string(),
      description: z.string(),
      isDiet: z.boolean(),
    })

    const createSchemaParamsMeal = z.object({
      userId: z.string(),
    })

    const { name, description, isDiet } = createSchemaMeal.parse(req.body)
    const { userId } = createSchemaParamsMeal.parse(req.params)
    console.log(name, description, isDiet)

    if (!name || !description || !isDiet) {
      throw new Error('[401] Preecha todos os campos para registar a refeição')
    }

    if (!userId) {
      throw new Error('Usuário não identificado.')
    }

    await knex('meals').insert({
      id: randomUUID(),
      name,
      description,
      isDiet,
      user_id: userId,
    })

    return res.status(201).send()
  })
}
