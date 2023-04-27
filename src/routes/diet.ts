import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'

export async function mealRoutes(app: FastifyInstance) {
  app.post('/:userId', async (req, res) => {
    const createSchemaMeal = z.object({
      name: z.string(),
      description: z.string(),
      isDiet: z.string(),
    })

    const createSchemaParamsMeal = z.object({
      userId: z.string(),
    })

    const { name, description, isDiet } = createSchemaMeal.parse(req.body)
    const { userId } = createSchemaParamsMeal.parse(req.params)

    if (!name || !description) {
      throw new Error('[401] Preecha todos os campos para registar a refeição')
    }

    if (!userId) {
      throw new Error('Usuário não identificado.')
    }

    const user = await knex('users').where('id', userId).first()

    if (!user) {
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

  app.get('/:userId', async (req, res) => {
    const createSchemaParamsMeal = z.object({
      userId: z.string(),
    })

    const { userId } = createSchemaParamsMeal.parse(req.params)

    if (!userId) {
      throw new Error('Usuário não identificado.')
    }

    const user = await knex('users').where('id', userId).first()

    if (!user) {
      throw new Error('Usuário não identificado.')
    }

    const listMealsUser = await knex('meals').where({ user_id: userId })

    if (listMealsUser.length <= 0) {
      throw new Error('Este usuário não tem nenhuma refeição')
    }

    return res.status(201).send(listMealsUser)
  })

  app.put('/:id', async (req, res) => {
    const createSchemaBodyMeal = z.object({
      name: z.coerce.string(),
      description: z.coerce.string(),
      isDiet: z.coerce.string(),
    })

    const createSchemaParamsMeal = z.object({
      id: z.string(),
    })

    const { id } = createSchemaParamsMeal.parse(req.params)
    let { name, description, isDiet } = createSchemaBodyMeal.parse(req.body)

    const meal = await knex('meals').where({ id }).first()

    if (!id) {
      throw new Error('Informe o endereço do prato.')
    }

    if (!meal) {
      throw new Error('Refeição não encontrada.')
    }

    if (name === 'undefined') {
      name = meal.name
    }

    if (description === 'undefined') {
      description = meal.description
    }

    if (isDiet === 'undefined') {
      isDiet = meal.isDiet
    }

    await knex('meals').where({ id: meal.id }).update({
      name,
      description,
      isDiet,
    })

    return res.status(200).send()
  })

  app.delete('/:id', async (req, res) => {
    const createSchemaParamsMeal = z.object({
      id: z.string(),
    })

    const { id } = createSchemaParamsMeal.parse(req.params)
    const meal = await knex('meals').where({ id }).first()

    if (!id) {
      throw new Error('Informe o endereço do prato a ser deletado.')
    }

    if (!meal) {
      throw new Error('Refeição não encontrada.')
    }

    await knex('meals').where({ id }).delete()

    return res.status(200).send()
  })
}
